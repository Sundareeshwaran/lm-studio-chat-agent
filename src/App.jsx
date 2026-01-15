import React, { useState, useEffect } from "react";
import { Menu, Bot } from "lucide-react";
import { LMStudioClient } from "@lmstudio/sdk";
import { useLMStudio } from "./hooks/useLMStudio";
import { Sidebar } from "./components/Sidebar";
import { ChatMessages } from "./components/ChatMessages";
import { ChatInput } from "./components/ChatInput";

const SYSTEM_PROMPT = {
  role: "system",
  content:
    "You are a specialized AI assistant strictly focused on AI tools, coding, and software technologies. You must ONLY answer questions directly related to these topics. If a user asks about anything else (e.g., movies, celebrities, general knowledge, politics, sports), you MUST refuse to answer and reply with a creative, AI-themed error message explaining that the topic is out of your scope.",
  timestamp: Date.now(),
};

const createNewSession = () => ({
  id: Date.now().toString(),
  title: "New Chat",
  messages: [SYSTEM_PROMPT],
  createdAt: Date.now(),
});

const App = () => {
  const {
    models,
    isConnected,
    isLoading,
    error,
    chat,
    checkConnection,
    baseUrl,
    setBaseUrl,
    stop,
    client,
  } = useLMStudio();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // key: chat_sessions
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("chat_sessions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Silent fail
      }
    }
    // Migration from legacy
    const legacy = localStorage.getItem("chat_messages");
    if (legacy) {
      try {
        const msgs = JSON.parse(legacy);
        return [
          {
            id: Date.now().toString(),
            title: "Previous Chat",
            messages: msgs,
            createdAt: Date.now(),
          },
        ];
      } catch {
        // Silent fail
      }
    }
    return [createNewSession()];
  });

  const [currentSessionId, setCurrentSessionId] = useState(
    () => sessions[0]?.id
  );
  const [input, setInput] = useState("");

  // Derived state for messages
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const messages = currentSession ? currentSession.messages : [];

  // Helper to update messages for current session
  const updateMessages = (newMessagesOrFn) => {
    setSessions((prevSessions) => {
      return prevSessions.map((session) => {
        if (session.id === currentSessionId) {
          const newMessages =
            typeof newMessagesOrFn === "function"
              ? newMessagesOrFn(session.messages)
              : newMessagesOrFn;
          return { ...session, messages: newMessages };
        }
        return session;
      });
    });
  };

  // Persist sessions whenever they change
  useEffect(() => {
    localStorage.setItem("chat_sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Handle switching sessions
  const switchSession = (sessionId) => {
    if (isLoading) return; // Prevent switching while streaming
    setCurrentSessionId(sessionId);
    // Messages derived from currentSessionId, no need to setMessages
    // Close sidebar on mobile when valid selection is made
    setIsSidebarOpen(false);
  };

  const handleNewChat = () => {
    if (isLoading) return;
    const newSession = createNewSession();
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsSidebarOpen(false);
  };

  const deleteSession = (e, sessionId) => {
    e.stopPropagation();
    if (isLoading && sessionId === currentSessionId) return;

    const newSessions = sessions.filter((s) => s.id !== sessionId);
    setSessions(newSessions);
    localStorage.setItem("chat_sessions", JSON.stringify(newSessions));

    if (sessionId === currentSessionId) {
      if (newSessions.length > 0) {
        setCurrentSessionId(newSessions[0].id);
      } else {
        // If all deleted, create a new one
        const fresh = createNewSession();
        setSessions([fresh]);
        setCurrentSessionId(fresh.id);
      }
    }
  };

  // Generate title for the session
  const generateSessionTitle = async (userPrompt, sessionId) => {
    try {
      if (!isConnected || models.length === 0 || !client) return;

      const model = await client.llm.model(models[0].path);

      // We don't await this to avoid blocking the UI, but we catch errors
      model
        .respond([
          {
            role: "system",
            content:
              "Generate a very short (3-5 words) title for this chat based on the user's first prompt. Do not use quotes. Output ONLY the title.",
          },
          { role: "user", content: userPrompt },
        ])
        .then((result) => {
          const title = result.content.trim().replace(/^["']|["']$/g, "");
          if (title) {
            setSessions((prev) =>
              prev.map((s) => (s.id === sessionId ? { ...s, title } : s))
            );
          }
        })
        .catch((err) => {
          console.error("Title generation background error", err);
        });
    } catch (err) {
      console.error("Title generation failed", err);
    }
  };

  const sendMessage = async (content) => {
    if (!content.trim() || isLoading) return;

    const userMessage = { role: "user", content, timestamp: Date.now() };
    updateMessages((prev) => [...prev, userMessage]);

    // Check if this is the first message to generate a title
    const sessionToUpdate = currentSessionId;
    if (messages.length === 1 && messages[0].role === "system") {
      generateSessionTitle(content, sessionToUpdate);
    }

    setInput("");

    try {
      // Create a temporary bot message for streaming
      updateMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", timestamp: Date.now() },
      ]);

      let fullResponse = "";
      let displayedResponse = "";
      let isStreaming = true;

      const updateUI = () => {
        if (!isStreaming && displayedResponse.length === fullResponse.length) {
          return;
        }

        if (displayedResponse.length < fullResponse.length) {
          const delta = fullResponse.length - displayedResponse.length;
          const chunkLength = Math.max(1, Math.ceil(delta / 10));

          const nextChunk = fullResponse.slice(
            displayedResponse.length,
            displayedResponse.length + chunkLength
          );

          displayedResponse += nextChunk;

          updateMessages((prev) => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === "assistant") {
              newMessages[newMessages.length - 1] = {
                ...lastMsg,
                content: displayedResponse,
              };
            }
            return newMessages;
          });
        }

        requestAnimationFrame(updateUI);
      };

      requestAnimationFrame(updateUI);

      await chat([...messages, userMessage], (token) => {
        fullResponse += token;
      });

      isStreaming = false;
    } catch (err) {
      updateMessages((prev) => prev.slice(0, -1));
      console.error("Failed to send message", err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleStop = () => {
    stop();
  };

  return (
    <div className="flex h-[100dvh] w-full bg-gray-900 text-gray-100 font-sans selection:bg-indigo-500/30 overflow-hidden">
      <Sidebar
        isConnected={isConnected}
        isLoading={isLoading}
        sessions={sessions}
        models={models}
        currentSessionId={currentSessionId}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        switchSession={switchSession}
        handleNewChat={handleNewChat}
        deleteSession={deleteSession}
        baseUrl={baseUrl}
        setBaseUrl={setBaseUrl}
        checkConnection={checkConnection}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-900 relative">
        {/* Header for Mobile */}
        <div className="md:hidden border-b border-gray-800 p-4 flex justify-between items-center bg-gray-950 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 mr-2 text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold flex items-center gap-2 flex-1">
            <Bot className="w-5 h-5 text-indigo-500" />
            LM Studio Chat
          </span>
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </div>

        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          error={error}
          onSend={sendMessage}
        />

        <ChatInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          handleStop={handleStop}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
};

export default App;
