import { useEffect, useState } from "react";

interface PlaybenchSession {
  id: string;
  [key: string]: unknown;
}

export default function PlaybenchPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [model, setModel] = useState("gpt-4o");

  const [sessions, setSessions] = useState<PlaybenchSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);

  // ---------------------------
  // LOAD SESSIONS
  // ---------------------------
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const res = await fetch("http://localhost:8000/playbench/sessions", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("mm_auth_token")}`
      }
    });

    const data = await res.json();
    setSessions(data.sessions || []);
  };

  // ---------------------------
  // LOAD MESSAGES
  // ---------------------------
  const loadMessages = async (sessionId: string) => {
    setActiveSession(sessionId);
    setResponse("");

    const res = await fetch(
      `http://localhost:8000/playbench/sessions/${sessionId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("mm_auth_token")}`,
        },
      }
    );

    const data = await res.json();

    let text = "";
    for (let msg of data.messages || []) {
      text += `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
    }

    setResponse(text);
  };

  // ---------------------------
  // SEND MESSAGE (STREAM)
  // ---------------------------
  const handleSend = async () => {
    setResponse("");

    const res = await fetch("http://localhost:8000/playbench/chat/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("mm_auth_token")}`,
      },
      body: JSON.stringify({
        prompt,
        model,
        session_id: activeSession,
      }),
    });

    const reader = res.body?.getReader();
    if (!reader) {
      setResponse("No response body available.");
      return;
    }
    const decoder = new TextDecoder();

    let fullText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (let line of lines) {
        if (line.startsWith("data: ")) {
          const json = JSON.parse(line.replace("data: ", ""));

          if (json.token) {
            fullText += json.token + " ";
            setResponse(fullText);
          }

          if (json.done) {
            loadSessions(); // refresh sessions after chat
          }
        }
      }
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
          <option value="gpt-4o">GPT-4o</option>
          <option value="claude-3-5-sonnet">Claude</option>
          <option value="llama-3">LLaMA</option>
        </select>

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