import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

function toClientDoc(doc: any) {
  const { _id, _creationTime, ...rest } = doc;
  return { id: _id, ...rest };
}

export const createContactMessage = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("contact_messages", {
      created_at: new Date().toISOString(),
      status: "new",
      name: args.name,
      phone: args.phone,
      email: args.email,
      message: args.message,
    });
    const doc = await ctx.db.get(id);
    if (!doc) return null;

    // Format the telegram message
    const telegramMessage = `
<b>📝 New Contact Message!</b>

<b>👤 Name:</b> ${args.name}
<b>📞 Phone:</b> ${args.phone}
<b>✉️ Email:</b> ${args.email}

<b>💬 Message:</b>
${args.message}
`;

    // Schedule sending message (fire and forget)
    await ctx.scheduler.runAfter(0, internal.telegram.sendMessage, { text: telegramMessage });

    return toClientDoc(doc);
  },
});

export const listContactMessages = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db
      .query("contact_messages")
      .order("desc")
      .collect();
    return messages.map(toClientDoc);
  },
});

export const updateContactMessageStatus = mutation({
  args: {
    id: v.id("contact_messages"),
    status: v.union(v.literal("new"), v.literal("resolved")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
    const doc = await ctx.db.get(args.id);
    if (!doc) return null;
    return toClientDoc(doc);
  },
});

export const deleteContactMessage = mutation({
  args: { id: v.id("contact_messages") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});
