import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function toClientDoc(doc: any) {
  const { _id, _creationTime, ...rest } = doc;
  return { id: _id, ...rest };
}

function generateSourceId() {
  const c = (globalThis as any).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `src_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export const getStays = query({
  args: {},
  handler: async (ctx) => {
    const stays = await ctx.db.query("stays").order("desc").collect();
    return stays.map(toClientDoc);
  },
});

export const createStay = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("Hotel"),
      v.literal("Homestay"),
      v.literal("Resort"),
      v.literal("Heritage Stay"),
    ),
    location: v.string(),
    amenities: v.optional(v.array(v.string())),
    thumbnail_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("stays", {
      sId: generateSourceId(),
      created_at: new Date().toISOString(),
      name: args.name,
      description: args.description,
      type: args.type,
      location: args.location,
      amenities: args.amenities ?? [],
      thumbnail_url: args.thumbnail_url,
    });
    const doc = await ctx.db.get(id);
    if (!doc) return null;
    return toClientDoc(doc);
  },
});

export const updateStay = mutation({
  args: {
    id: v.id("stays"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("Hotel"),
        v.literal("Homestay"),
        v.literal("Resort"),
        v.literal("Heritage Stay"),
      ),
    ),
    location: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
    thumbnail_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...maybe } = args;
    const patch: any = {};
    for (const [k, v] of Object.entries(maybe)) {
      if (v !== undefined) patch[k] = v;
    }
    await ctx.db.patch(id, patch);
    const doc = await ctx.db.get(id);
    if (!doc) return null;
    return toClientDoc(doc);
  },
});

export const deleteStay = mutation({
  args: { id: v.id("stays") },
  handler: async (ctx, args) => {
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_stay_id", (q) => q.eq("stay_id", args.id))
      .collect();
    for (const room of rooms) {
      const images = await ctx.db
        .query("room_images")
        .withIndex("by_room_id", (q) => q.eq("room_id", room._id))
        .collect();
      for (const img of images) await ctx.db.delete(img._id);
      await ctx.db.delete(room._id);
    }
    await ctx.db.delete(args.id);
    return null;
  },
});

export const getRoomsByStayId = query({
  args: { stayId: v.id("stays") },
  handler: async (ctx, args) => {
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_stay_id", (q) => q.eq("stay_id", args.stayId))
      .collect();
    return rooms.map(toClientDoc);
  },
});

export const createRoom = mutation({
  args: {
    stayId: v.id("stays"),
    name: v.string(),
    price: v.number(),
    capacity: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const stay = await ctx.db.get(args.stayId);
    if (!stay) throw new Error("Stay not found");
    const id = await ctx.db.insert("rooms", {
      sId: generateSourceId(),
      created_at: new Date().toISOString(),
      stay_id: args.stayId,
      s_stay_id: (stay as any).sId ?? String(args.stayId),
      name: args.name,
      price: args.price,
      capacity: args.capacity,
      description: args.description,
    });
    const doc = await ctx.db.get(id);
    if (!doc) return null;
    return toClientDoc(doc);
  },
});

export const updateRoom = mutation({
  args: {
    id: v.id("rooms"),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    capacity: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...maybe } = args;
    const patch: any = {};
    for (const [k, v] of Object.entries(maybe)) {
      if (v !== undefined) patch[k] = v;
    }
    await ctx.db.patch(id, patch);
    const doc = await ctx.db.get(id);
    if (!doc) return null;
    return toClientDoc(doc);
  },
});

export const deleteRoom = mutation({
  args: { id: v.id("rooms") },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("room_images")
      .withIndex("by_room_id", (q) => q.eq("room_id", args.id))
      .collect();
    for (const img of images) await ctx.db.delete(img._id);
    await ctx.db.delete(args.id);
    return null;
  },
});

export const createRoomImage = mutation({
  args: {
    roomId: v.id("rooms"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    const id = await ctx.db.insert("room_images", {
      sId: generateSourceId(),
      created_at: new Date().toISOString(),
      room_id: args.roomId,
      s_room_id: (room as any).sId ?? String(args.roomId),
      url: args.url,
    });
    const doc = await ctx.db.get(id);
    if (!doc) return null;
    return toClientDoc(doc);
  },
});

export const getRoomImages = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("room_images")
      .withIndex("by_room_id", (q) => q.eq("room_id", args.roomId))
      .collect();
    return images.map(toClientDoc);
  },
});

export const deleteRoomImage = mutation({
  args: { id: v.id("room_images") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});

