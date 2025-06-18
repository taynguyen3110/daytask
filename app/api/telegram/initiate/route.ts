import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!telegramBotToken) {
    return NextResponse.json({ error: 'Telegram bot token not configured' }, { status: 500 });
  }

  const body = await request.json();
  const { chat_id } = body;

  if (!chat_id) {
    return NextResponse.json({ error: 'chat_id is required' }, { status: 400 });
  }

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id,
        text: "Welcome! You'll be receiving reminders for your tasks in this channel.",
      }),
    });

    const data = await telegramResponse.json();

    if (!telegramResponse.ok) {
      return NextResponse.json({ error: data.description || 'Telegram API error' }, { status: telegramResponse.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
