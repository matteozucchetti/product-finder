import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const insertProduct = mutation({
  args: {
    title: v.string(),
    imageUrl: v.string(),
    imageEmbedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('products', args);
  },
});

export const getAllProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('products').collect();
  },
});
