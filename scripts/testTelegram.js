const token = "8624872875:AAG9Uyz7WuflpPVvKrLBz2HZ9ifYbGejtuU";
const chatId = "8676402125";

async function testMessage() {
  try {
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
    if (data.ok) {
      console.log("Test message sent successfully!");
    } else {
      console.error("Failed to send:", data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testMessage();
