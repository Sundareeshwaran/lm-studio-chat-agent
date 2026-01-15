import { useState, useEffect, useCallback, useRef } from "react";
import { LMStudioClient } from "@lmstudio/sdk";

export function useLMStudio() {
  // Load saved URL or default to localhost
  // Load saved URL or automatically determine it based on current hostname
  const [baseUrl, setBaseUrlState] = useState(() => {
    // If a custom URL is saved, use it
    const saved = localStorage.getItem("lm_studio_url");
    if (saved) return saved;

    // Otherwise, assume LM Studio is running on the same machine as the web server
    // This works perfect for:
    // - localhost -> ws://localhost:1234
    return `ws://${window.location.hostname}:1234`;
  });

  const [client, setClient] = useState(null);
  const [models, setModels] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const setBaseUrl = (url) => {
    setBaseUrlState(url);
    localStorage.setItem("lm_studio_url", url);
  };

  const checkConnection = useCallback(async () => {
    if (!client) return;
    try {
      // Basic connectivity check: list models
      const fetchedModels = await client.system.listDownloadedModels();
      setModels(fetchedModels);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      console.error("LM Studio connection error:", err);
      setIsConnected(false);
      setError(
        `Could not connect to ${baseUrl}. Check IP and ensure server is running.`
      );
    }
  }, [client, baseUrl]);

  // Initialize client when baseUrl changes
  useEffect(() => {
    try {
      const newClient = new LMStudioClient({ baseUrl });
      setClient(newClient);
    } catch (err) {
      console.error("Failed to initialize LM Studio client", err);
      setError("Invalid URL configuration");
    }
  }, [baseUrl]);

  // Check connection whenever client changes
  useEffect(() => {
    if (client) {
      checkConnection();
    }
  }, [client, checkConnection]);

  // Ref to hold the current prediction for cancellation
  const predictionRef = useRef(null);

  const stop = () => {
    if (predictionRef.current) {
      predictionRef.current.cancel();
      predictionRef.current = null;
      setIsLoading(false);
    }
  };

  const chat = async (messages, onToken) => {
    if (!client) return;

    setIsLoading(true);
    setError(null);
    try {
      // Find a loaded model or just use any available for now
      const modelPath = models[0]?.path;

      if (!modelPath) {
        throw new Error(
          "No models found. Please download a model in LM Studio."
        );
      }

      // Get the model (using the path as identifier)
      const model = await client.llm.model(modelPath);

      const prediction = model.respond(messages);
      predictionRef.current = prediction;

      let fullResponse = "";
      for await (const chunk of prediction) {
        fullResponse += chunk.content;
        onToken(chunk.content);
      }

      return fullResponse;
    } catch (err) {
      // Ignore cancellation errors
      if (err.message && err.message.includes("canceled")) {
        return;
      }
      console.error("Chat error:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
      predictionRef.current = null;
    }
  };

  return {
    models,
    isConnected,
    isLoading,
    error,
    checkConnection,
    chat,
    baseUrl,
    setBaseUrl,
    stop,
    client,
  };
}
