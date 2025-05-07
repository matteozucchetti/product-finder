import { query } from "./_generated/server";
import { v } from "convex/values";
import { OpenAI } from "openai";

// Carica la chiave da variabile d’ambiente
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const searchProducts = query({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const { prompt } = args;

    // 1. Embedding del prompt con OpenAI
    const embeddingResponse = await openai.embeddings.create({
      input: prompt,
      model: "text-embedding-3-small",
    });

    const userVector = embeddingResponse.data[0].embedding;

    // 2. Recupera tutti i prodotti
    const products = await ctx.db.query("products").collect();

    // 3. Calcola cosine similarity tra userVector e ogni embedding prodotto
    function cosineSimilarity(a: number[], b: number[]) {
      const dot = a.reduce((acc, val, i) => acc + val * b[i], 0);
      const normA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
      const normB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
      return dot / (normA * normB);
    }

    const ranked = products
      .map((product) => ({
        ...product,
        similarity: cosineSimilarity(userVector, product.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3); // Top 3

    return ranked;
  },
});