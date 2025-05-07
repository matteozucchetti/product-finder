import { action } from "./_generated/server";
import { OpenAI } from "openai";
import { api } from "./_generated/api";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN!;
const CLIP_MODEL_VERSION = "1c0371070cb827ec3c7f2f28adcdde54b50dcd239aa6faea0bc98b174ef03fb4";

export const seedFromFakeStore = action(async (ctx) => {
  const res = await fetch("https://fakestoreapi.com/products");
  const products = await res.json();
  const productsToSeed = products.slice(0, 20);

  for (const product of productsToSeed) {
    const embeddingRes = await openai.embeddings.create({
      input: product.description,
      model: "text-embedding-3-small",
    });
    const embedding = embeddingRes.data[0].embedding;

    // STEP 1 – Chiamata a Replicate
    const predictionRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: CLIP_MODEL_VERSION,
        input: {
          image: product.image,
          task: "embed_image",
        },
      }),
    });

    const prediction = await predictionRes.json();

    // STEP 2 – Polling finché non termina
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

    if (status !== "succeeded") {
      throw new Error("Errore nel generare embedding immagine");
    }

    // STEP 3 – Salva embedding nel prodotto
    const imageEmbedding = result.embedding;

    await ctx.runMutation(api.products.insertProduct, {
      title: product.title,
      description: product.description,
      imageUrl: product.image,
      embedding,
      imageEmbedding,
    });
  }

  return "Seed completato!";
});