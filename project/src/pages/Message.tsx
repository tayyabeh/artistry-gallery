import React, { useEffect, useRef, useState } from "react";
import "./Message.css";

interface ChatMessage {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
}

// --- Mock API layer -------------------------------------------------------
// In a real implementation, replace these with real API calls
const fetchMessages = async (): Promise<ChatMessage[]> => {
  // Simulated network delay
  await new Promise((res) => setTimeout(res, 300));
  return [
    { id: 1, sender: "Alice", content: "Hello!", timestamp: "12:30" },
    { id: 2, sender: "You", content: "Hi Alice!", timestamp: "12:31" },
  ];
};

const sendMessageAPI = async (message: string): Promise<ChatMessage> => {
  await new Promise((res) => setTimeout(res, 200));
  return {
    id: Math.random(),
    sender: "You",
    content: message,
    timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};
// --------------------------------------------------------------------------

export default function Message() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch initial messages
  useEffect(() => {
    fetchMessages().then(setMessages);
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = await sendMessageAPI(input.trim());
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  return (
    <div className="message-container">
      <div className="message-list">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-bubble ${
              msg.sender === "You" ? "sent" : "received"
            }`}
          >
            <div className="sender">{msg.sender}</div>
            <div className="content">{msg.content}</div>
            <div className="timestamp">{msg.timestamp}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-area" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
