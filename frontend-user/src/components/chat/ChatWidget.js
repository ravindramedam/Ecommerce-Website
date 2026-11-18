"use client";

import { useState } from "react";
import Link from "next/link";
import apiService from "@/services/apiService";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      reply: "Ask me about a product, shipping, cancellation, or your orders. For any queries, contact our customer support at 9010076453.",
      products: [],
      orders: [],
    },
  ]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || sending) return;

    setMessages((current) => [...current, { from: "user", reply: message, products: [], orders: [] }]);
    setInput("");
    setSending(true);

    try {
      const response = await apiService.post("/chat", { message });
      const data = response.data?.data || {};
      setMessages((current) => [
        ...current,
        {
          from: "bot",
          reply: data.reply || "I couldn't answer that.",
          products: data.products || [],
          orders: data.orders || [],
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { from: "bot", reply: "The shop assistant is unavailable right now.", products: [], orders: [] },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[70] print:hidden">
      {open && (
        <div className="mb-3 flex h-[420px] w-[min(92vw,340px)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center gap-2 bg-blue-600 px-4 py-3 text-white">
            <img
              src="https://img.magnific.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg?semt=ais_hybrid&w=740&q=80"
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
            <p className="text-sm font-semibold">Fashion Book assistant</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((message, index) => (
              <div key={index} className={message.from === "user" ? "text-right" : "text-left"}>
                <div
                  className={`inline-block max-w-[90%] rounded-lg px-3 py-2 text-left text-sm ${
                    message.from === "user" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p>
                    {message.reply.split("9010076453").map((part, partIndex, parts) => (
                      <span key={partIndex}>
                        {part}
                        {partIndex < parts.length - 1 && (
                          <a href="tel:9010076453" className="font-semibold underline">
                            9010076453
                          </a>
                        )}
                      </span>
                    ))}
                  </p>
                  {message.products?.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {message.products.map((product) => (
                        <li key={product.id}>
                          <Link href={`/products/${product.id}`} className="font-medium text-blue-700 underline">
                            {product.name} · ₹{product.price}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {message.orders?.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {message.orders.map((order) => (
                        <li key={order.id}>
                          <Link href={`/orders/${order.id}`} className="font-medium text-blue-700 underline">
                            Order #{String(order.id).slice(-6).toUpperCase()} · {order.status}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t border-gray-200 p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about a product or order"
              className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-black"
            />
            <button
              type="submit"
              disabled={sending}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {sending ? "..." : "Send"}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative ml-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-lg"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <img
          src="https://img.magnific.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg?semt=ais_hybrid&w=740&q=80"
          alt=""
          className="h-full w-full object-cover"
        />
        {open && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-2xl font-bold text-white">
            ×
          </span>
        )}
      </button>
    </div>
  );
}
