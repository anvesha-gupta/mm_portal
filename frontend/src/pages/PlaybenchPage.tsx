import { useEffect, useState } from "react";
import api, { API_BASE_URL, getAuthToken } from "../services/api";

interface PlaybenchSession {
  id: string;
  created_at?: string;
  [key: string]: unknown;
}

interface PlaybenchMessage {
  id: string;
  role: string;
  content: string;
}

export default function PlaybenchPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [availableModels, setAvailableModels] = useState<string[]>(["gpt-4o"]);

  const [sessions, setSessions] = useState<PlaybenchSession[]>([]);
  const [messages, setMessages] = useState<PlaybenchMessage[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------
  // LOAD SESSIONS
  // ---------------------------
  useEffect(() => {
    loadSessions();
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const { data } = await api.get("/playbench/models");
      setAvailableModels(data.models || ["gpt-4o"]);
      if (data.models?.length) {
        setModel(data.models[0]);
      }
    } catch (error) {
      console.error("Error loading models", error);
      setError("Unable to load available models.");
    }
  };

  const loadSessions = async () => {
    try {
      const { data } = await api.get("/playbench/sessions");
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Error loading sessions", error);
      setError("Unable to load Playbench sessions.");
    }
  };

  // ---------------------------
  // LOAD MESSAGES
  // ---------------------------
  const loadMessages = async (sessionId: string) => {
    setActiveSession(sessionId);
    setResponse("");
    setMessages([]);

    try {
      const { data } = await api.get(`/playbench/sessions/${sessionId}/messages`);
      setMessages(data.messages || []);
      setResponse(
        (data.messages || [])
          .map((msg: PlaybenchMessage) => `${msg.role.toUpperCase()}: ${msg.content}`)
          .join("\n\n")
      );
    } catch (error) {
      console.error("Error loading messages", error);
    }
  };

  // ---------------------------
  // SEND MESSAGE (STREAM)
  // ---------------------------
  const handleSend = async () => {
    if (!prompt.trim()) {
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Unable to obtain authentication token.");
      }

      const res = await fetch(`${API_BASE_URL}/playbench/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          model,
          session_id: activeSession,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Streaming request failed");
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("No response body available.");
      }
      const decoder = new TextDecoder();

      let fullText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const payload = line.replace("data: ", "").trim();
          if (payload === "[DONE]") {
            continue;
          }

          const json = JSON.parse(payload);
          if (json.token) {
            fullText += json.token;
            setResponse(fullText);
          }

          if (json.done) {
            await loadSessions();
          }
        }
      }

      setPrompt("");
    } catch (error) {
      console.error("Error sending message", error);
      setResponse("Unable to send message. Check browser console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* SIDEBAR */}
      <div style={{ width: 250, borderRight: "1px solid #ccc", padding: 10 }}>
        <button onClick={() => setActiveSession(null)}>
          + New Chat
        </button>

        <h4>Sessions</h4>

        {sessions.map((s) => (
          <div
            key={s.id}
            onClick={() => loadMessages(s.id)}
            style={{
              cursor: "pointer",
              padding: 5,
              background: activeSession === s.id ? "#eee" : "transparent"
            }}
          >
            {s.id.slice(0, 8)}
          </div>
        ))}
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, padding: 20 }}>
        <h2>Playbench</h2>

        <select value={model} onChange={(e) => setModel(e.target.value)}>
          {availableModels.map((availableModel) => (
            <option key={availableModel} value={availableModel}>
              {availableModel}
            </option>
          ))}
        </select>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}

        <br /><br />

        <textarea
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ width: "100%" }}
        />

        <button onClick={handleSend}>Send</button>

        <hr />

        <pre style={{ whiteSpace: "pre-wrap" }}>{response}</pre>
      </div>
    </div>
  );
}