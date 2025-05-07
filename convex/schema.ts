import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    title: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    embedding: v.array(v.float64()), // vettore di embedding testuale
    imageEmbedding: v.array(v.float64()), // vettore di embedding immagine
  }),

  queries: defineTable({
    prompt: v.string(),
    embedding: v.array(v.float64()),
    createdAt: v.number(),
  }),
});