import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { messages, sellerContext } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key not configured" },
        { status: 500 }
      );
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `
You are a highly intelligent and helpful AI assistant for sellers on the LokKart (One District One Product) platform.
The seller is asking questions about their dashboard data (orders, earnings, stock, returns, etc).
Always reply in a friendly, professional tone. If the user asks in Hindi or Hinglish, reply in the same language.

Here is the current real-time data for this seller's store:
${JSON.stringify(sellerContext, null, 2)}

Use this data to answer their questions accurately. For example:
- If they ask "iss hafte me kitne ruppee aaye" or "what is my revenue", sum up the totals from the orders or refer to the analytics data.
- If they ask "aaj kitne order aaye hai", count the active/pending orders.
- If they ask "koi return parcel hai kya", check the returns data.
Do not hallucinate data. If the answer is not in the data provided, say so politely.
Keep responses concise and direct unless the user asks for a detailed breakdown.
    `.trim();

    // Convert OpenAI style messages to Gemini style contents
    const contents = messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Prepend the system instructions as the first user message (or inject via systemInstruction if supported, but prepending is safer across versions)
    contents.unshift({
      role: "user",
      parts: [{ text: systemPrompt }]
    });
    
    // Also add a dummy model response so the alternating pattern user->model->user is preserved.
    contents.splice(1, 0, {
      role: "model",
      parts: [{ text: "Understood. I have access to the seller's data and will assist them accurately." }]
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.2,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return NextResponse.json({ success: true, reply: rawText });
      }
    } else {
      const errText = await response.text();
      console.warn("Gemini Chat response error:", errText);
      return NextResponse.json({ success: false, error: errText }, { status: 500 });
    }
  } catch (error) {
    console.error("Seller Chat Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
