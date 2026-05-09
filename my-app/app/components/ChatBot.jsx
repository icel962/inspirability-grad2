"use client";

import { useState } from "react";
import axios from "axios";
import "./chatbot.css";

export default function ChatBot() {

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi 👋 How can I help you today?",
    },
  ]);

  const sendMessage = async () => {

    if (!message.trim()) return;

    const userMessage = {
      sender: "user",
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {

      const res = await axios.post(
        "http://localhost:5000/api/chat",
        {
          message,
        }
      );
       const botMessage = {
        sender: "bot",
        text: res.data.reply,
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Something went wrong 😢",
        },
      ]);
    }

    setMessage("");
  };

  return (
    <>

      {/* Floating Button */}
      <div
        className="chat-toggle"
        onClick={() => setOpen(!open)}
      >
        💬
      </div>
       {/* Chat Window */}
      {open && (
        <div className="chat-container">

          <div className="chat-header">
            Inspirability AI
          </div>

          <div className="chat-messages">

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender}`}
              >
                {msg.text}
              </div>
            ))}

          </div>

          <div className="chat-input-area">

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask anything..."
            />

            <button onClick={sendMessage}>
              Send
            </button>

          </div>
        </div>
      )}
    </>
  );
}