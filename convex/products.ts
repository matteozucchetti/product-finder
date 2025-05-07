import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const insertProduct = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        imageUrl: v.string(),
        embedding: v.array(v.float64()),
        imageEmbedding: v.array(v.float64()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("products", args);
    },
});

export const getAllProducts = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("products").collect();
    },
});