import React from "react";
import { Send, Square } from "lucide-react";

export function ChatInput({
  input,
  setInput,
  handleSubmit,
  isLoading,
  handleStop,
  isConnected,
}) {
  return (
    <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-gray-950/50 border-t border-gray-800 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isConnected ? "Ask about AI tools..." : "Connecting to LM Studio..."
          }
          disabled={!isConnected || isLoading}
          className="w-full bg-gray-900/80 border border-gray-700 rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 placeholder-gray-500 transition-all text-base md:text-sm shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={isLoading ? handleStop : undefined}
          disabled={(!input.trim() && !isLoading) || !isConnected}
          className={`absolute right-2 top-2 p-1.5 rounded-lg text-white transition-all duration-200 ${
            isLoading
              ? "bg-red-500 hover:bg-red-600"
              : "bg-indigo-600 hover:bg-indigo-500 disabled:opacity-0 disabled:scale-90"
          }`}
        >
          {isLoading ? (
            <Square className="w-5 h-5 fill-current" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
      <div className="text-center mt-2">
        <p className="text-[10px] text-gray-600">
          Make sure{" "}
          <a
            href="https://lmstudio.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 underline"
          >
            LM Studio
          </a>{" "}
          is running and "Start Server" is enabled.
        </p>
      </div>
    </div>
  );
}
