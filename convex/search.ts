import { action } from "./_generated/server";
import { v } from "convex/values";
import { OpenAI } from "openai";
import { api } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";

// Carica la chiave da variabile d'ambiente
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

type Product = Doc<"products"> & { similarity?: number };

type SearchProductsArgs = { prompt: string };
type SearchProductsResult = Product[];

export const searchProducts = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx: any, args: SearchProductsArgs): Promise<SearchProductsResult> => {
    const { prompt } = args;

    // 1. Embedding del prompt con OpenAI
    const embeddingResponse = await openai.embeddings.create({
      input: prompt,
      model: "text-embedding-3-small",
    });

    const userVector: number[] = embeddingResponse.data[0].embedding;

    // 2. Recupera tutti i prodotti tramite query
    const products: Product[] = await ctx.runQuery(api.products.getAllProducts, {});

    // 3. Calcola cosine similarity tra userVector e ogni embedding prodotto
    function cosineSimilarity(a: number[], b: number[]) {
      const dot = a.reduce((acc, val, i) => acc + val * b[i], 0);
      const normA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
      const normB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
      return dot / (normA * normB);
    }

    const ranked: Product[] = (products as Product[])
      .map((product: Product) => ({
        ...product,
        similarity: cosineSimilarity(userVector, product.embedding),
      }))
      .sort((a: Product, b: Product) => (b.similarity ?? 0) - (a.similarity ?? 0))
      .slice(0, 3); // Top 3

    return ranked;
  },
});