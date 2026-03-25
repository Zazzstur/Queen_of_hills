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

export const getRoutes = query({
  args: {},
  handler: async (ctx) => {
    const routes = await ctx.db.query("routes").order("desc").collect();
    return routes.map(toClientDoc);
  },
});

export const createRoute = mutation({
  args: {
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal("direct"), v.literal("sightseeing"))),
    origin: v.string(),
    destination: v.string(),
    price4Seater: v.number(),
    price6SeaterLuxurySuv: v.number(),
    price6to10SeaterSuv: v.number(),
    capacity: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("routes", {
      sId: generateSourceId(),
      created_at: new Date().toISOString(),
      name: args.name,
      type: args.type ?? "sightseeing",
      origin: args.origin,
      destination: args.destination,
      basePrice: args.price4Seater,
      price4Seater: args.price4Seater,
      price6SeaterLuxurySuv: args.price6SeaterLuxurySuv,
      price6to10SeaterSuv: args.price6to10SeaterSuv,
      capacity: args.capacity,
      description: args.description,
      coverImage: args.coverImage,
    });
    const doc = await ctx.db.get(id);
    if (!doc) return null;
    return toClientDoc(doc);
  },
});

export const updateRoute = mutation({
  args: {
    id: v.id("routes"),
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal("direct"), v.literal("sightseeing"))),
    origin: v.optional(v.string()),
    destination: v.optional(v.string()),
    price4Seater: v.optional(v.number()),
    price6SeaterLuxurySuv: v.optional(v.number()),
    price6to10SeaterSuv: v.optional(v.number()),
    capacity: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...maybe } = args;
    const patch: any = {};
    for (const [k, v] of Object.entries(maybe)) {
      if (v !== undefined) patch[k] = v;
    }
    if (args.price4Seater !== undefined) {
      patch.basePrice = args.price4Seater;
    }
    await ctx.db.patch(id, patch);
    const doc = await ctx.db.get(id);
    if (!doc) return null;
    return toClientDoc(doc);
  },
});

export const deleteRoute = mutation({
  args: { id: v.id("routes") },
  handler: async (ctx, args) => {
    const stops = await ctx.db
      .query("stops")
      .withIndex("by_route_id", (q) => q.eq("route_id", args.id))
      .collect();
    for (const stop of stops) {
      const images = await ctx.db
        .query("stop_images")
        .withIndex("by_stop_id", (q) => q.eq("stop_id", stop._id))
        .collect();
      for (const img of images) await ctx.db.delete(img._id);
      await ctx.db.delete(stop._id);
    }
    await ctx.db.delete(args.id);
    return null;
  },
});

export const getStopsByRouteId = query({
  args: { routeId: v.id("routes") },
  handler: async (ctx, args) => {
    const stops = await ctx.db
      .query("stops")
      .withIndex("by_route_id", (q) => q.eq("route_id", args.routeId))
      .collect();
    return stops.map(toClientDoc);
  },
});

export const addStop = mutation({
  args: {
    routeId: v.id("routes"),
    name: v.string(),
    detourPrice: v.optional(v.number()),
    price4Seater: v.optional(v.number()),
    price6SeaterLuxurySuv: v.optional(v.number()),
    price6to10SeaterSuv: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const route = await ctx.db.get(args.routeId);
    if (!route) throw new Error("Route not found");
    const id = await ctx.db.insert("stops", {
      sId: generateSourceId(),
      created_at: new Date().toISOString(),
      route_id: args.routeId,
      s_route_id: (route as any).sId ?? String(args.routeId),
      name: args.name,
      detourPrice: args.detourPrice ?? 0,
      price4Seater: args.price4Seater ?? 0,
      price6SeaterLuxurySuv: args.price6SeaterLuxurySuv ?? 0,
      price6to10SeaterSuv: args.price6to10SeaterSuv ?? 0,
      description: args.description,
    });
    const doc = await ctx.db.get(id);
    if (!doc) return null;
    return toClientDoc(doc);
  },
});

export const updateStop = mutation({
  args: {
    id: v.id("stops"),
    name: v.optional(v.string()),
    detourPrice: v.optional(v.number()),
    price4Seater: v.optional(v.number()),
    price6SeaterLuxurySuv: v.optional(v.number()),
    price6to10SeaterSuv: v.optional(v.number()),
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

export const deleteStop = mutation({
  args: { id: v.id("stops") },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("stop_images")
      .withIndex("by_stop_id", (q) => q.eq("stop_id", args.id))
      .collect();
    for (const img of images) await ctx.db.delete(img._id);
    await ctx.db.delete(args.id);
    return null;
  },
});

export const addStopImages = mutation({
  args: { images: v.array(v.object({ stopId: v.id("stops"), url: v.string() })) },
  handler: async (ctx, args) => {
    const created: any[] = [];
    for (const img of args.images) {
      const stop = await ctx.db.get(img.stopId);
      if (!stop) throw new Error("Stop not found");
      const id = await ctx.db.insert("stop_images", {
        sId: generateSourceId(),
        created_at: new Date().toISOString(),
        stop_id: img.stopId,
        s_stop_id: (stop as any).sId ?? String(img.stopId),
        url: img.url,
      });
      const doc = await ctx.db.get(id);
      if (doc) created.push(toClientDoc(doc));
    }
    return created;
  },
});

export const getStopImages = query({
  args: { stopId: v.id("stops") },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("stop_images")
      .withIndex("by_stop_id", (q) => q.eq("stop_id", args.stopId))
      .collect();
    return images.map(toClientDoc);
  },
});
