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
    const TELEGRAM_CHAT_ID_2 = process.env.TELEGRAM_CHAT_ID_2;

    if (!TELEGRAM_BOT_TOKEN) {
      console.error("Telegram integration: Bot token is missing.");
      return { success: false, error: "Bot token is missing" };
    }

    // Create an array of chat IDs to send to (filtering out empty ones)
    const chatIds = [TELEGRAM_CHAT_ID, TELEGRAM_CHAT_ID_2].filter(Boolean);

    if (chatIds.length === 0) {
      console.error("Telegram integration: No Chat IDs are configured. Please set TELEGRAM_CHAT_ID in environment variables.");
      return { success: false, error: "Chat IDs are missing" };
    }

    try {
      const results = await Promise.all(
        chatIds.map(async (chatId) => {
          const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: args.text,
              parse_mode: "HTML",
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to send Telegram message to ${chatId}:`, errorText);
            
            // Handle rate limiting specifically (HTTP 429)
            if (response.status === 429) {
                console.error(`Telegram rate limit exceeded for ${chatId}.`);
                return { success: false, error: "Rate limit exceeded", chatId };
            }
            
            return { success: false, error: errorText, chatId };
          }
          
          return { success: true, chatId };
        })
      );

      const hasErrors = results.some(r => !r.success);
      if (hasErrors) {
        return { success: false, results };
      }

      console.log("Telegram messages sent successfully to all configured accounts!");
      return { success: true };
    } catch (error: any) {
      console.error("Error sending Telegram message:", error);
      return { success: false, error: error.message };
    }
  },
});
