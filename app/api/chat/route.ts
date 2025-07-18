import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type Message = {
  role: string;
  content: string;
};

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing Gemini API key." }, { status: 500 });
  }

  // Gemini expects a single prompt string or a list of message objects
  // We'll concatenate the messages for a simple chat experience
  const prompt = (messages as Message[]).map((m) => `${m.role}: ${m.content}`).join("\n");

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" + apiKey,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error }, { status: response.status });
  }

  const data = await response.json();
  // Gemini's response format
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
  return NextResponse.json({ reply });
} 