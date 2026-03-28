import { v } from "convex/values";
import { internalAction } from "./_generated/server";

export const sendMessage = internalAction({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    // You can set these in your Convex Dashboard Environment Variables
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8624872875:AAG9Uyz7WuflpPVvKrLBz2HZ9ifYbGejtuU";
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN) {
      console.error("Telegram integration: Bot token is missing.");
      return { success: false, error: "Bot token is missing" };
    }

    if (!TELEGRAM_CHAT_ID) {
      console.error("Telegram integration: Chat ID is missing. Please set TELEGRAM_CHAT_ID in environment variables.");
      return { success: false, error: "Chat ID is missing" };
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: args.text,
          parse_mode: "HTML",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to send Telegram message:", errorText);
        
        // Handle rate limiting specifically (HTTP 429)
        if (response.status === 429) {
            console.error("Telegram rate limit exceeded.");
            return { success: false, error: "Rate limit exceeded" };
        }
        
        return { success: false, error: errorText };
      }

      console.log("Telegram message sent successfully!");
      return { success: true };
    } catch (error: any) {
      console.error("Error sending Telegram message:", error);
      return { success: false, error: error.message };
    }
  },
});
