'use client';

import Image from "next/image";
import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "system",
      content:
        "小学生に分かりやすく教える先生です。難しい言葉は使わず、やさしく・丁寧に・簡単な言葉で説明してください。",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault(); //フォーム送信時のページの再読み込みを防ぐ
    if (!input.trim()) return; //入力が空、またはスペースのみの場合は、何もせずに処理を終了する
    const newMessages = [...messages, { role: "user", content: input }];
    //現在の会話履歴 (messages) に、ユーザーが新しく入力したメッセージ ({ role: "user", ... })
    //を追加して、newMessagesという新しい配列を作成します。
    setMessages(newMessages); //MessagesをnewMessagesに更新する
    setInput(""); //inputを空にする
    setLoading(true); //Loading開始

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, //これから送るデータ本体（body）はJSON形式ですよ、ということを伝える
        body: JSON.stringify({ messages: newMessages }), //newMessagesをmessagesという名前でreq.bodyに送信する
      });

      //APIからのレスポンスを受け取って、newMessagesに、{ role: "assistant", content: data.reply }を追加する
      const data = await res.json();
      if (data.error) {
        setMessages([...newMessages, { role: "assistant", content: `Error: ${data.error}` }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Error: Could not get response." }]);
    }
    setLoading(false); //Loading終了
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>AI Chatbot</h1>
      <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, minHeight: 300, background: "#fafafa" }}>
        {/*
          messagesという配列（会話履歴）の中身を一つずつ取り出す
          mはmessagesの中身の一つ一つの要素を指す
          iはmessagesの中身の一つ一つの要素のインデックスを指す
          mapの構文。
          m.roleがuserの場合は"You"、assistantの場合は"AI"、systemの場合は"System"を返す

          loading がtrueの場合は、"AI is typing..."と表示する
         */}
        {messages.map((m, i) => (
          <div key={i} style={{ margin: "8px 0", textAlign: m.role === "user" ? "right" : "left" }}>
            <b>{m.role === "user" ? "You" : m.role === "assistant" ? "AI" : "System"}:</b> {m.content}
          </div>
        ))}
        {loading && <div>AI is typing...</div>}
      </div>
      <form onSubmit={sendMessage} style={{ display: "flex", marginTop: 16 }}>
        <input
          type="text"
          value={input} //inputの内容をbox内に表示する
          onChange={e => setInput(e.target.value)}
            //入力欄の内容が変更されたときに実行される処理です。
            // e.target.valueで、入力された現在のテキストを取得できます。
            // setInput(...)で、そのテキストをReactの状態変数に保存します。
          placeholder="Type your message..." //text inputに薄文字で表示する
          style={{ flex: 1, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          disabled={loading} //loadingがtrueの場合は、inputを無効化する
        />
        <button type="submit" disabled={loading || !input.trim()} style={{ marginLeft: 8, padding: "8px 16px" }}>
          Send
          {/*
            loadingがtrueの場合は、"Send"を無効化する
            loadingがfalseの場合は、"Send"を有効化する
            inputが空の場合は、"Send"を無効化する
          */}
        </button>
      </form>
    </div>
  );
}
