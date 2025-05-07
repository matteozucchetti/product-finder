import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { pollReplicatePrediction } from "./utils/pollReplicatePrediction";
import { cosineSimilarity } from "./utils/cosineSimilarity";

type Product = Doc<"products"> & { similarity?: number };
type SearchProductsArgs = { prompt: string };
type SearchProductsResult = Product[];

const CLIP_MODEL_VERSION = "1c0371070cb827ec3c7f2f28adcdde54b50dcd239aa6faea0bc98b174ef03fb4";
const TEXT_WEIGHT = 0.1;
const IMAGE_WEIGHT = 0.9;

// Get the prompt text embedding via CLIP
async function getClipEmbeddingFromPrompt(prompt: string): Promise<number[]> {
  const predictionRes = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: CLIP_MODEL_VERSION,
      input: {
        text: prompt,
        task: "embed_text",
      },
    }),
  });
  const prediction = await predictionRes.json();
  const { status, output } = await pollReplicatePrediction(prediction.id, process.env.REPLICATE_API_TOKEN!);
  if (status !== "succeeded") throw new Error("CLIP embedding failed");
  return output.embedding;
}

export const searchProducts = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args: SearchProductsArgs): Promise<SearchProductsResult> => {
    const { prompt } = args;

    // 1. Text embedding via CLIP
    const userTextEmbedding = await getClipEmbeddingFromPrompt(prompt);

    // 2. Image embedding via CLIP
    const userImageEmbedding = await getClipEmbeddingFromPrompt(prompt);

    // 3. Get products
    const products: Product[] = await ctx.runQuery(api.products.getAllProducts, {});

    // 4. Combined similarity
    const ranked: Product[] = (products as Product[])
      .map((product: Product) => {
        const textScore = cosineSimilarity(userTextEmbedding, product.embedding);
        const imageScore = cosineSimilarity(userImageEmbedding, product.imageEmbedding);
        const finalScore = textScore * TEXT_WEIGHT + imageScore * IMAGE_WEIGHT;
        return {
          ...product,
          textScore,
          imageScore,
          similarity: finalScore,
        };
      })
      .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
      .slice(0, 5);

    return ranked;
  },
});