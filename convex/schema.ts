import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  products: defineTable({
    title: v.string(),
    imageUrl: v.string(),
    imageEmbedding: v.array(v.float64()),
  }),
});
