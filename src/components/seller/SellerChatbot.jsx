"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SellerChatbot({ seller, orders, returns, analytics }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am your AI Seller Assistant. Ask me anything about your orders, returns, or earnings! (e.g. 'aaj kitne order aaye hai')",
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = { role: "user", content: inputValue.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const sellerContext = {
        sellerInfo: seller,
        analytics,
        totalOrdersCount: orders?.length || 0,
        ordersSummary: orders?.map(o => ({
          id: o.id,
          status: o.status,
          total: o.total,
          items: o.items?.map(i => i.name).join(", "),
          customerDistrict: o.customer?.district
        })).slice(0, 50),
        pendingReturnsCount: returns?.filter(r => r.status === "pending").length || 0,
        returnsSummary: returns?.map(r => ({
          id: r.id,
          reason: r.reason,
          status: r.status
        }))
      };

      const res = await fetch("/api/ai/seller-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          sellerContext
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Oops, I encountered an error answering your question. Please try again." }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong with the connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="h-[56px] w-[56px] rounded-full bg-brand-primary text-primary-foreground shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center p-0"
          >
            <Sparkles className="w-6 h-6 text-brand-tertiary" />
          </Button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[360px] h-[520px] z-50 flex flex-col p-0 rounded-card border-brand-line bg-card shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-[16px] bg-card border-b border-brand-line flex items-center justify-between shrink-0">
            <div className="flex items-center gap-[12px]">
              <div className="w-10 h-10 rounded-full bg-brand-primary text-primary-foreground flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-brand-tertiary" />
              </div>
              <div>
                <h3 className="text-md font-bold text-brand-primary">AI Seller Assistant</h3>
                <p className="text-xs font-medium text-brand-subtle">Online</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="h-[32px] w-[32px] p-0 rounded-full bg-card border-brand-line text-brand-subtle hover:bg-muted hover:text-brand-primary cursor-pointer transition-transform active:scale-[0.98]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-[16px] overflow-y-auto custom-scrollbar space-y-[16px]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
              >
                <div
                  className={`px-[16px] py-[12px] text-sm font-medium shadow-sm leading-relaxed [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:mt-2 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:ml-5 [&>ol]:mt-2 [&>ol]:space-y-1 [&>strong]:font-bold [&>p]:mb-2 last:[&>p]:mb-0 ${msg.role === "user"
                      ? "bg-brand-primary text-primary-foreground rounded-[16px] rounded-br-[4px]"
                      : "bg-muted border border-brand-line text-brand-primary rounded-[16px] rounded-bl-[4px]"
                    }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="mr-auto max-w-[85%]">
                <div className="px-[16px] py-[12px] bg-muted border border-brand-line rounded-[16px] rounded-bl-[4px] text-brand-subtle flex items-center gap-[8px]">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-tertiary" />
                  <span className="text-xs font-medium">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-[16px] bg-card border-t border-brand-line shrink-0">
            <form onSubmit={handleSend} className="relative flex items-center">
              <Input
                type="text"
                placeholder="Ask about orders, earnings..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="h-[48px] w-full pl-4 pr-14 bg-muted border-brand-line rounded-input text-sm font-bold text-brand-primary placeholder:text-brand-subtle placeholder:font-medium focus-visible:ring-1 focus-visible:ring-brand-tertiary focus-visible:border-brand-tertiary shadow-sm transition-all"
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="absolute right-[6px] h-[36px] w-[36px] p-0 rounded-button bg-brand-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition-transform active:scale-[0.98] cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}
    </>
  );
}