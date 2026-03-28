const token = "8624872875:AAG9Uyz7WuflpPVvKrLBz2HZ9ifYbGejtuU";

async function getChatId() {
  console.log("Fetching updates from Telegram...");
  console.log("Please make sure you have sent at least one message to your bot.");
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
    const data = await response.json();
    
    if (data.ok && data.result.length > 0) {
      // Get the latest message
      const latestUpdate = data.result[data.result.length - 1];
      const chatId = latestUpdate.message?.chat?.id || latestUpdate.my_chat_member?.chat?.id;
      
      if (chatId) {
        console.log("\n✅ Found your Chat ID!");
        console.log(`Your Chat ID is: ${chatId}`);
        console.log(`\nTo configure Convex with this Chat ID, run:`);
        console.log(`npx convex env set TELEGRAM_CHAT_ID ${chatId}`);
      } else {
        console.log("\n⚠️ No chat ID found in the latest update.");
        console.log("Try sending a new message to your bot and run this script again.");
      }
    } else {
      console.log("\n⚠️ No messages found. Please send a message to your bot first, then run this script again.");
    }
  } catch (error) {
    console.error("Error fetching updates:", error.message);
  }
}

getChatId();
