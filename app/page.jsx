"use client";
import Image from "next/image";
import { useState } from "react";
import Markdown from "./components/Markdown";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "model",
      parts: [
        {
          text: `Hi, I'm the Abuakwa Pharmacy Support Agent, how can I assist you today?`,
        },
      ],
    },
  ]);

  const [message, setMessage] = useState("");

  const sendMessage = async function () {
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", parts: [{ text: message }] },
      { role: "model", parts: [{ text: "" }] },
    ]);
    const reponse = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ...messages,
        { role: "user", parts: [{ text: message }] },
      ]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = "";
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        result += decoder.decode(value || new Int8Array(), { stream: true });

        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              parts: [{ text: result }],
            },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  return (
    <main className="flex min-h-screen min-w-full flex-col items-center p-10 bg-slate-100">
      <div className="flex flex-col border-slate-400 shadow-md border p-5 gap-2 rounded-2xl">
        <div className=" w-[600px] h-[700px] p-5 overflow-auto no-scrollbar">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat ${
                msg.role == "model" ? "chat-start" : "chat-end"
              }`}
            >
              <div className="chat-image avatar">
                <div className="w-10 rounded-full shadow-md">
                  <Image
                    alt="ai-img"
                    quality={100}
                    width={8}
                    height={8}
                    unoptimized
                    className="object-fit"
                    src={`${msg.role == "model" ? "/ai.png" : "/user.png"}`}
                  />
                </div>
              </div>
              <div className="chat-header">
                {msg.role == "model" ? "Abuakwa AI Assistant" : ""}
              </div>
              <div
                className={`chat-bubble text-white ${
                  msg.role == "model" ? "chat-bubble-primary" : ""
                }`}
              >
                {msg.parts.map((history, idx) => (
                  <Markdown key={idx} text={history.text} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex py-1 px-2 gap-4 border border-slate-400 rounded-2xl items-center ">
          <textarea
            rows={1}
            name="message"
            placeholder="message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            id=""
            className="bg-transparent w-full text-black focus:outline-none p-2 focus:placeholder-transparent"
          ></textarea>{" "}
          <button className="btn btn-sm" onClick={sendMessage}>
            send
          </button>
        </div>
      </div>
    </main>
  );
}
