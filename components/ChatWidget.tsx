"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, User, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "bot";
  content: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Merhaba! Size nasıl yardımcı olabilirim?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Use server-side API proxy instead of direct webhook
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) throw new Error("Ağ hatası");

      const data = await response.json();
      const botReply = data.output || data.message || "Üzgünüm, şu an yanıt veremiyorum.";

      setMessages((prev) => [...prev, { role: "bot", content: botReply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: "bot", content: "Bir hata oluştu. Lütfen tekrar deneyin." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white/80 backdrop-blur-xl border-2 border-brand-black rounded-2xl shadow-neo flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-brand-yellow border-b-2 border-brand-black flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-black rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-brand-yellow" />
                </div>
                <h3 className="font-bold text-brand-black">Banana AI 🚀</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-brand-black/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2 max-w-[85%]",
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-brand-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
                    msg.role === "user" ? "bg-brand-red" : "bg-brand-yellow"
                  )}>
                    {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-brand-black" />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-xl border-2 border-brand-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    msg.role === "user" ? "bg-white" : "bg-brand-yellow/10"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 mr-auto">
                  <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center border-2 border-brand-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-black" />
                  </div>
                  <div className="p-3 rounded-xl border-2 border-brand-black bg-brand-yellow/10 text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] italic">
                    Düşünüyor...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t-2 border-brand-black">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Bir mesaj yazın..."
                  className="flex-grow p-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="p-2 bg-brand-yellow border-2 border-brand-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-yellow border-2 border-brand-black rounded-full flex items-center justify-center shadow-neo cursor-pointer"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
