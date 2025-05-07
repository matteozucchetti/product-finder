import { v } from 'convex/values';
import { api } from './_generated/api';
import type { Doc } from './_generated/dataModel';
import { action } from './_generated/server';
import { cosineSimilarity } from './utils/cosineSimilarity';
import { pollReplicatePrediction } from './utils/pollReplicatePrediction';

type Product = Doc<'products'> & { similarity?: number };
type SearchProductsArgs = { prompt: string };
type SearchProductsResult = Product[];

const CLIP_MODEL_VERSION = '1c0371070cb827ec3c7f2f28adcdde54b50dcd239aa6faea0bc98b174ef03fb4';

// Get the prompt text embedding via CLIP
async function getClipEmbeddingFromPrompt(prompt: string): Promise<number[]> {
  const predictionRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: CLIP_MODEL_VERSION,
      input: {
        text: prompt,
        task: 'embed_text',
      },
    }),
  });
  const prediction = await predictionRes.json();
  const { status, output } = await pollReplicatePrediction(prediction.id, process.env.REPLICATE_API_TOKEN!);
  if (status !== 'succeeded') throw new Error('CLIP embedding failed');
  return output.embedding;
}

export const searchProducts = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args: SearchProductsArgs): Promise<SearchProductsResult> => {
    const { prompt } = args;
    const promptEmbedding = await getClipEmbeddingFromPrompt(prompt);
    const products: Product[] = await ctx.runQuery(api.products.getAllProducts, {});
    const ranked: Product[] = (products as Product[])
      .map((product: Product) => {
        const score = cosineSimilarity(promptEmbedding, product.imageEmbedding);
        return {
          ...product,
          similarity: score,
        };
      })
      .filter((product: Product) => (product.similarity ?? 0) > 0.15)
      .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
      .slice(0, 5);

    return ranked;
  },
});
