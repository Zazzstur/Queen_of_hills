import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const upsertStay = mutation({
  args: {
    sId: v.string(),
    created_at: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("Hotel"),
      v.literal("Homestay"),
      v.literal("Resort"),
      v.literal("Heritage Stay"),
    ),
    location: v.string(),
    amenities: v.array(v.string()),
    thumbnail_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("stays")
      .withIndex("by_sId", (q) => q.eq("sId", args.sId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("stays", args);
  },
});

export const upsertRoom = mutation({
  args: {
    sId: v.string(),
    created_at: v.string(),
    stay_id: v.id("stays"),
    s_stay_id: v.string(),
    name: v.string(),
    price: v.number(),
    capacity: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rooms")
      .withIndex("by_sId", (q) => q.eq("sId", args.sId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("rooms", args);
  },
});

export const upsertRoomImage = mutation({
  args: {
    sId: v.string(),
    created_at: v.string(),
    room_id: v.id("rooms"),
    s_room_id: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("room_images")
      .withIndex("by_sId", (q) => q.eq("sId", args.sId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("room_images", args);
  },
});

export const upsertRoute = mutation({
  args: {
    sId: v.string(),
    created_at: v.string(),
    origin: v.string(),
    destination: v.string(),
    basePrice: v.number(),
    capacity: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("routes")
      .withIndex("by_sId", (q) => q.eq("sId", args.sId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("routes", args);
  },
});

export const upsertStop = mutation({
  args: {
    sId: v.string(),
    created_at: v.string(),
    route_id: v.id("routes"),
    s_route_id: v.string(),
    name: v.string(),
    detourPrice: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("stops")
      .withIndex("by_sId", (q) => q.eq("sId", args.sId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("stops", args);
  },
});

export const upsertStopImage = mutation({
  args: {
    sId: v.string(),
    created_at: v.string(),
    stop_id: v.id("stops"),
    s_stop_id: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("stop_images")
      .withIndex("by_sId", (q) => q.eq("sId", args.sId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("stop_images", args);
  },
});

