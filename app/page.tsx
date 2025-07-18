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
    e.preventDefault();
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages([...newMessages, { role: "assistant", content: `Error: ${data.error}` }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Error: Could not get response." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>AI Chatbot</h1>
      <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, minHeight: 300, background: "#fafafa" }}>
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
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} style={{ marginLeft: 8, padding: "8px 16px" }}>
          Send
        </button>
      </form>
    </div>
  );
}
