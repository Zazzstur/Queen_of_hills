import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  stays: defineTable({
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
  }).index("by_sId", ["sId"]),

  rooms: defineTable({
    sId: v.string(),
    created_at: v.string(),
    stay_id: v.id("stays"),
    s_stay_id: v.string(),
    name: v.string(),
    price: v.number(),
    capacity: v.number(),
    description: v.optional(v.string()),
  })
    .index("by_sId", ["sId"])
    .index("by_stay_id", ["stay_id"]),

  room_images: defineTable({
    sId: v.string(),
    created_at: v.string(),
    room_id: v.id("rooms"),
    s_room_id: v.string(),
    url: v.string(),
  })
    .index("by_sId", ["sId"])
    .index("by_room_id", ["room_id"]),

  routes: defineTable({
    sId: v.string(),
    created_at: v.string(),
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal("direct"), v.literal("sightseeing"))),
    origin: v.string(),
    destination: v.string(),
    basePrice: v.number(),
    price4Seater: v.optional(v.number()),
    price6SeaterLuxurySuv: v.optional(v.number()),
    price6to10SeaterSuv: v.optional(v.number()),
    capacity: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  }).index("by_sId", ["sId"]),

  stops: defineTable({
    sId: v.string(),
    created_at: v.string(),
    route_id: v.id("routes"),
    s_route_id: v.string(),
    name: v.string(),
    detourPrice: v.number(),
    price4Seater: v.optional(v.number()),
    price6SeaterLuxurySuv: v.optional(v.number()),
    price6to10SeaterSuv: v.optional(v.number()),
    description: v.optional(v.string()),
    isDestination: v.optional(v.boolean()),
  })
    .index("by_sId", ["sId"])
    .index("by_route_id", ["route_id"]),

  stop_images: defineTable({
    sId: v.string(),
    created_at: v.string(),
    stop_id: v.id("stops"),
    s_stop_id: v.string(),
    url: v.string(),
  })
    .index("by_sId", ["sId"])
    .index("by_stop_id", ["stop_id"]),

  bookings: defineTable({
    created_at: v.string(),
    status: v.union(
      v.literal("new"),
      v.literal("confirmed"),
      v.literal("cancelled"),
    ),
    contact: v.object({
      name: v.string(),
      email: v.optional(v.string()),
      phone: v.string(),
      pickupLocation: v.string(),
    }),
    service: v.object({
      type: v.string(),
      id: v.string(),
      title: v.optional(v.string()),
      origin: v.optional(v.string()),
      destination: v.optional(v.string()),
    }),
    booking: v.object({
      startDate: v.optional(v.string()),
      endDate: v.optional(v.string()),
      timeSlot: v.optional(v.string()),
      guests: v.number(),
      stopNames: v.optional(v.array(v.string())),
    }),
    pricing: v.object({
      subtotal: v.number(),
      taxes: v.number(),
      total: v.number(),
    }),
  })
    .index("by_status", ["status"])
    .index("by_created_at", ["created_at"]),

  contact_messages: defineTable({
    created_at: v.string(),
    status: v.union(v.literal("new"), v.literal("resolved")),
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    message: v.string(),
  })
    .index("by_status", ["status"])
    .index("by_created_at", ["created_at"]),
});
