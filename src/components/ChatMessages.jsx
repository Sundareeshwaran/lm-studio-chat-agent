import React, { useRef, useEffect, useState } from "react";
import { Bot, User, AlertCircle, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion as Motion, AnimatePresence } from "framer-motion";
import remarkGfm from "remark-gfm";

// Generic Copy Button Component
const CopyButton = ({ text, className = "" }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded-lg text-gray-400 hover:text-white transition-all duration-200 ${className}`}
      title="Copy to clipboard"
    >
      {isCopied ? (
        <Check className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
};

// Custom Code Block Renderer
const CodeBlock = ({ inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const codeContent = String(children).replace(/\n$/, "");

  if (!inline && match) {
    return (
      <div className="relative my-4 rounded-lg overflow-hidden bg-gray-950/50 border border-gray-700/50 group/code">
        {/* Code Header */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800/50 border-b border-gray-700/50">
          <span className="text-xs font-mono text-gray-400 lowercase">
            {language}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 opacity-0 group-hover/code:opacity-100 transition-opacity">
              Copy {language}
            </span>
            <CopyButton text={codeContent} className="hover:bg-gray-700/50" />
          </div>
        </div>
        {/* Code Content */}
        <div className="overflow-x-auto p-3">
          <code className={className} {...props}>
            {children}
          </code>
        </div>
      </div>
    );
  }

  // Fallback for inline code or code without language
  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

const SUGGESTIONS = [
  { label: "Explain quantum computing", icon: "⚛️" },
  { label: "Write a Python script for scraping", icon: "🐍" },
  { label: "Analyze this code snippet", icon: "🔍" },
  { label: "Create a workout plan", icon: "💪" },
];

export function ChatMessages({ messages, isLoading, error, onSend }) {
  const visibleMessages = messages.filter((m) => m.role !== "system");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
      {visibleMessages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-6 opacity-100">
          <Motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-24 h-24 bg-indigo-600/20 rounded-3xl flex items-center justify-center mb-2 ring-1 ring-indigo-500/30 shadow-lg shadow-indigo-500/10"
          >
            <Bot className="w-12 h-12 text-indigo-400" />
          </Motion.div>

          <Motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center space-y-2"
          >
            <h2 className="text-4xl font-bold text-gray-100 tracking-tight">
              LM-Studio AI Agent
            </h2>
            <p className="text-lg text-gray-400 max-w-md mx-auto leading-relaxed">
              Your powerful local assistant for coding, writing, and analysis.
            </p>
          </Motion.div>

          {/* Suggestions Grid */}
          <Motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl px-4 mt-4"
          >
            {SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onSend(suggestion.label)}
                disabled={isLoading}
                className="flex items-center gap-3 p-4 bg-gray-800/40 hover:bg-gray-800/80 border border-gray-700/50 hover:border-indigo-500/30 rounded-xl transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                  {suggestion.icon}
                </span>
                <span className="text-sm font-medium text-gray-300 group-hover:text-indigo-300 transition-colors">
                  {suggestion.label}
                </span>
              </button>
            ))}
          </Motion.div>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {visibleMessages.map((msg, idx) => (
            <Motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-4 group ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role !== "user" && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center mt-1">
                  <Bot className="w-5 h-5 text-indigo-400" />
                </div>
              )}

              <div
                className={`relative max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3.5 leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-gray-800/80 text-gray-200 rounded-bl-sm border border-gray-700/50 pr-10"
                }`}
              >
                {msg.role === "user" ? (
                  msg.content
                ) : (
                  <>
                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-900/50 prose-pre:border prose-pre:border-gray-700/50 overflow-x-scroll">
                      {msg.content === "" &&
                      isLoading &&
                      idx === visibleMessages.length - 1 ? (
                        <div className="flex gap-1 items-center h-6 px-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                        </div>
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code: CodeBlock,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                    {!msg.isImage &&
                      (!isLoading || idx !== visibleMessages.length - 1) && (
                        <CopyButton
                          text={msg.content}
                          className="absolute top-2 right-2 bg-gray-800/50 hover:bg-gray-700/50"
                        />
                      )}
                  </>
                )}
              </div>

              {msg.role === "user" && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mt-1">
                  <User className="w-5 h-5 text-gray-300" />
                </div>
              )}
            </Motion.div>
          ))}
        </AnimatePresence>
      )}

      {error && (
        <div className="flex justify-center my-4">
          <div className="bg-red-900/20 text-red-200 border border-red-900/50 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
