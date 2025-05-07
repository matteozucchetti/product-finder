import { action } from "./_generated/server";
import { v } from "convex/values";
import { OpenAI } from "openai";
import { api } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";

// Carica la chiave da variabile d'ambiente
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN!;
const CLIP_MODEL_VERSION = "1c0371070cb827ec3c7f2f28adcdde54b50dcd239aa6faea0bc98b174ef03fb4";

type Product = Doc<"products"> & { similarity?: number };

type SearchProductsArgs = { prompt: string };
type SearchProductsResult = Product[];

// Cosine similarity helper
function cosineSimilarity(a: number[], b: number[]) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return 0;
  const dot = a.reduce((acc, val, i) => acc + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
  const normB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
  return dot / (normA * normB);
}

// Ottieni embedding del prompt via CLIP (embed_text)
async function getClipEmbeddingFromPrompt(prompt: string): Promise<number[]> {
  const predictionRes = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${REPLICATE_API_TOKEN}`,
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

  let status = prediction.status;
  let result;
  while (status === "starting" || status === "processing") {
    await new Promise((res) => setTimeout(res, 1000));
    const check = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
      },
    });
    const checkJson = await check.json();
    status = checkJson.status;
    result = checkJson.output;
  }

  if (status !== "succeeded") throw new Error("CLIP embedding fallito");

  return result.embedding;
}

export const searchProducts = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args: SearchProductsArgs): Promise<SearchProductsResult> => {
    const { prompt } = args;

    // 1. Embedding testuale con OpenAI
    const openAiEmbedding = await openai.embeddings.create({
      input: prompt,
      model: "text-embedding-3-small",
    });
    const userTextEmbedding: number[] = openAiEmbedding.data[0].embedding;

    // 2. Embedding visivo del prompt con CLIP
    const userImageEmbedding = await getClipEmbeddingFromPrompt(prompt);

    // 3. Ottieni prodotti
    const products: Product[] = await ctx.runQuery(api.products.getAllProducts, {});

    // 4. Similarità combinata
    const ranked: Product[] = (products as Product[])
      .map((product: Product) => {
        // Defensive: extract array if wrapped in {embedding: [...]}
        const productEmbedding = Array.isArray(product.embedding)
          ? product.embedding
          : (typeof product.embedding === 'object' && product.embedding !== null && 'embedding' in product.embedding)
            ? (product.embedding as { embedding: number[] }).embedding
            : undefined;

        const productImageEmbedding = Array.isArray(product.imageEmbedding)
          ? product.imageEmbedding
          : (typeof product.imageEmbedding === 'object' && product.imageEmbedding !== null && 'embedding' in product.imageEmbedding)
            ? (product.imageEmbedding as { embedding: number[] }).embedding
            : undefined;

        const textScore = productEmbedding
          ? cosineSimilarity(userTextEmbedding, productEmbedding)
          : 0;

        const imageScore = productImageEmbedding
          ? cosineSimilarity(userImageEmbedding, productImageEmbedding)
          : 0;

        const finalScore = textScore * 0.2 + imageScore * 0.8;

        return {
          ...product,
          textScore,
          imageScore,
          similarity: finalScore,
        };
      })
      .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
      .slice(0, 3);

    return ranked;
  },
});