import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

function toClientDoc(doc: any) {
  const { _id, _creationTime, ...rest } = doc;
  return { id: _id, ...rest };
}

export const createBooking = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("bookings", {
      created_at: new Date().toISOString(),
      status: "new",
      contact: args.contact,
      service: args.service,
      booking: args.booking,
      pricing: args.pricing,
    });
    const doc = await ctx.db.get(id);
    if (!doc) return null;

    // Prepare service name
    let serviceName = args.service.title || args.service.type;
    if (args.service.origin && args.service.destination) {
      serviceName = `${args.service.origin} to ${args.service.destination}`;
    }

    // Format the telegram message
    const message = `
<b>🔔 New Booking Alert!</b>

<b>👤 Customer:</b> ${args.contact.name}
<b>📞 Phone:</b> ${args.contact.phone}
<b>✉️ Email:</b> ${args.contact.email || "N/A"}
<b>📍 Pickup:</b> ${args.contact.pickupLocation}

<b>🏷️ Service:</b> ${serviceName}
<b>📅 Start Date:</b> ${args.booking.startDate ? new Date(args.booking.startDate).toLocaleDateString() : "N/A"}
<b>🕒 Time Slot:</b> ${args.booking.timeSlot || "N/A"}
<b>👥 Guests:</b> ${args.booking.guests}
${args.booking.stopNames && args.booking.stopNames.length > 0 ? `<b>🛑 Stops:</b> ${args.booking.stopNames.join(", ")}\n` : ""}
<b>💰 Total Price:</b> ₹${args.pricing.total}
`;

    // Schedule sending message (fire and forget to not block the booking creation)
    await ctx.scheduler.runAfter(0, internal.telegram.sendMessage, { text: message });

    return toClientDoc(doc);
  },
});

export const listBookings = query({
  args: {},
  handler: async (ctx) => {
    const bookings = await ctx.db.query("bookings").order("desc").collect();
    return bookings.map(toClientDoc);
  },
});

export const updateBookingStatus = mutation({
  args: {
    id: v.id("bookings"),
    status: v.union(
      v.literal("new"),
      v.literal("confirmed"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
    const doc = await ctx.db.get(args.id);
    if (!doc) return null;
    return toClientDoc(doc);
  },
});

export const deleteBooking = mutation({
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});

