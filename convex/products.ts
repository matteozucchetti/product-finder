import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const insertProduct = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        imageUrl: v.string(),
        embedding: v.array(v.float64()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("products", args);
    },
});