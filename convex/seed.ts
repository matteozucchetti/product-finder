import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { pollReplicatePrediction } from "./utils/pollReplicatePrediction";

const CLIP_MODEL_VERSION = "1c0371070cb827ec3c7f2f28adcdde54b50dcd239aa6faea0bc98b174ef03fb4";

export const seedFromFakeStore = action(async (ctx) => {
  // Fetch products from an example API
  const res = await fetch("https://fakestoreapi.com/products");
  const products = await res.json();

  for (const product of products) {
    // Wait 5 seconds between each product to avoid rate limiting
    await new Promise((res) => setTimeout(res, 5000));

    console.log(`Processing product ${product.title}`);

    // Generate description embedding via Replicate CLIP
    const textPredictionRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: CLIP_MODEL_VERSION,
        input: {
          text: product.description,
          task: "embed_text",
        },
      }),
    });
    const textPrediction = await textPredictionRes.json();

    const { status: textStatus, output: textResult } = await pollReplicatePrediction(
      textPrediction.id,
      process.env.REPLICATE_API_TOKEN!
    );
    if (textStatus !== "succeeded") {
      throw new Error("Error generating text embedding");
    }
    const embedding = textResult.embedding;

    // Generate image embedding via Replicate CLIP
    const imagePredictionRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN!}`,
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
    const imagePrediction = await imagePredictionRes.json();

    const { status: imageStatus, output: imageResult } = await pollReplicatePrediction(
      imagePrediction.id,
      process.env.REPLICATE_API_TOKEN!
    );
    if (imageStatus !== "succeeded") {
      throw new Error("Error generating image embedding");
    }
    const imageEmbedding = imageResult.embedding;

    // Save product to database
    await ctx.runMutation(api.products.insertProduct, {
      title: product.title,
      description: product.description,
      imageUrl: product.image,
      embedding,
      imageEmbedding,
    });
  }

  return "Seed completed!";
});
