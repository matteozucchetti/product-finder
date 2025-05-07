import { action } from "./_generated/server";
import { OpenAI } from "openai";
import { api } from "./_generated/api";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const seedFromFakeStore = action(async (ctx) => {
  const res = await fetch("https://fakestoreapi.com/products");
  const products = await res.json();

  for (const product of products) {
    const embeddingRes = await openai.embeddings.create({
      input: product.description,
      model: "text-embedding-3-small",
    });

    const embedding = embeddingRes.data[0].embedding;

    await ctx.runMutation(api.products.insertProduct, {
      title: product.title,
      description: product.description,
      imageUrl: product.image,
      embedding,
    });
  }

  return "Seed completato!";
});