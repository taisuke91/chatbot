import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

//Messagaの型を定義
type Message = {
  role: string;
  content: string;
};

//POSTリクエストを受け取る
export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing Gemini API key." }, { status: 500 });
  }

  // Add a system prompt to always answer as a teacher for elementary school students
  const systemPrompt = "あなたは小学生に分かりやすく教える先生です。難しい言葉は使わず、やさしく・丁寧に・簡単な言葉で説明してください。";

  
  //AIに渡す会話履歴を1つのテキストにまとめるためのコード
  //あなたは親切なAIです。
  // user: こんにちは
  // assistant: こんにちは、どうしましたか？
  // user: 東大に行きたいです
  // assistant: 東大に行きたいですね。それはすごい目標です。
  // user: どうやったらいいですか？
  // assistant: 東大に行きたい場合は、まずは学校の勉強を頑張りましょう。そして、志望校の過去問を解いて、どのような問題が出るかを確認しましょう。その後、志望校の対策をしていきましょう。
  // (今までの会話履歴をまとめたもの)
  const prompt = [systemPrompt, ...(messages as Message[]).map((m) => `${m.role}: ${m.content}`)].join("\n");

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