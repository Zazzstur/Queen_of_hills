const token = "8624872875:AAG9Uyz7WuflpPVvKrLBz2HZ9ifYbGejtuU";
const chatIds = ["8676402125", "8572424135"];

async function testMessage() {
  try {
    const results = await Promise.all(
      chatIds.map(async (chatId) => {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "<b>✅ Telegram Integration Successful!</b>\n\nYour website is now connected to Telegram. You will receive booking and contact form alerts here.",
            parse_mode: "HTML"
          })
        });

        const data = await response.json();
        return { chatId, ok: data.ok, data };
      })
    );

    console.log(results);
  } catch (error) {
    console.error("Error:", error);
  }
}

testMessage();
