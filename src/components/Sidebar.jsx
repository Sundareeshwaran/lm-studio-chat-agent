import React, { useState, useEffect, memo } from "react";
import {
  Sparkles,
  MessageSquare,
  Trash2,
  Settings,
  Plus,
  X,
} from "lucide-react";

export const Sidebar = memo(
  function Sidebar({
    isConnected,
    isLoading,
    sessions,
    models = [],
    currentSessionId,
    isSidebarOpen,
    setIsSidebarOpen,
    switchSession,
    handleNewChat,
    deleteSession,
    baseUrl,
    setBaseUrl,
    checkConnection,
    selectedModel,
    setSelectedModel,
  }) {
    const [showSettings, setShowSettings] = useState(false);
    const [tempUrl, setTempUrl] = useState(baseUrl);

    useEffect(() => {
      setTempUrl(baseUrl);
    }, [baseUrl]);

    return (
      <>
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar / Connection Status Area */}
        <div
          className={`fixed md:relative inset-y-0 left-0 w-64 border-r border-gray-800 bg-gray-950 flex flex-col z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-gray-800/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-600 rounded-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-bold text-sm tracking-tight">
                LM Studio Chat
              </h1>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-3 pb-0">
            <button
              onClick={handleNewChat}
              disabled={isLoading}
              className="w-full flex items-center gap-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 border border-indigo-600/20 rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-800">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
              History
            </div>
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => switchSession(session.id)}
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm transition-all ${
                  currentSessionId === session.id
                    ? "bg-gray-800 text-gray-100"
                    : "text-gray-400 hover:bg-gray-900 hover:text-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 truncate flex-1">
                  <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                  <span className="truncate">{session.title}</span>
                </div>
                <button
                  onClick={(e) => deleteSession(e, session.id)}
                  className="text-red-500"
                  title="Delete Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Footer / Status */}
          <div className="p-4 border-t border-gray-800 bg-gray-950">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Status
            </div>
            <div
              className={`flex flex-col gap-2 p-3 rounded-lg border ${
                isConnected
                  ? "bg-green-500/5 border-green-500/20"
                  : "bg-red-500/5 border-red-500/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isConnected ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>

              {isConnected && models.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                    Model
                  </span>
                  <select
                    value={selectedModel || ""}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    {models.map((model) => (
                      <option key={model.path} value={model.path}>
                        {model.path.split("/").pop()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-300 uppercase tracking-wider w-full transition-colors mb-2"
            >
              <Settings className="w-3 h-3" />
              <span>Settings</span>
            </button>

            {showSettings && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-1 duration-200 mb-2">
                <input
                  type="text"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="ws://localhost:1234"
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => {
                    setBaseUrl(tempUrl);
                    setShowSettings(false);
                    checkConnection();
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1 rounded transition-colors"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    // We only want to re-render if:
    // 1. isConnected, isLoading, isSidebarOpen, currentSessionId changed
    // 2. sessions structure changed (length or specific titles/ids)
    // 3. models changed
    // We explicitly IGNORE deep changes in session.messages for the sidebar list

    if (
      prevProps.isConnected !== nextProps.isConnected ||
      prevProps.isLoading !== nextProps.isLoading ||
      prevProps.isSidebarOpen !== nextProps.isSidebarOpen ||
      prevProps.currentSessionId !== nextProps.currentSessionId ||
      prevProps.baseUrl !== nextProps.baseUrl ||
      prevProps.models !== nextProps.models ||
      prevProps.selectedModel !== nextProps.selectedModel
    ) {
      return false;
    }

    // Check sessions shallow equality for sidebar display purposes
    if (prevProps.sessions.length !== nextProps.sessions.length) return false;

    for (let i = 0; i < prevProps.sessions.length; i++) {
      if (
        prevProps.sessions[i].id !== nextProps.sessions[i].id ||
        prevProps.sessions[i].title !== nextProps.sessions[i].title
      ) {
        return false;
      }
    }

    return true;
  },
);
