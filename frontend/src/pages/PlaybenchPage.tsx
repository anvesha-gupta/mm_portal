import React, { useEffect, useState, useRef, useMemo } from "react";
import api, { API_BASE_URL, getAuthToken } from "../services/api";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import ForumIcon from "@mui/icons-material/Forum";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
interface AllowedModel {
  llm_id: string;
  display_name: string;
  provider: string;
  assigned_tokens: number;
  used_tokens: number;
  remaining_tokens: number;
  model_name?: string;
}

interface PlaybenchSession {
  id: string;
  created_at: string;
  display_name: string;
  is_own: boolean;
}

interface PlaybenchMessage {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

export default function PlaybenchPage() {
  const [prompt, setPrompt] = useState("");
  const [streamResponse, setStreamResponse] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");
  const [availableModels, setAvailableModels] = useState<AllowedModel[]>([]);

  const [sessions, setSessions] = useState<PlaybenchSession[]>([]);
  const [messages, setMessages] = useState<PlaybenchMessage[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loadingModels, setLoadingModels] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ---------------------------
  // LOAD INITIAL DATA
  // ---------------------------
  useEffect(() => {
    loadModels();
    loadSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamResponse]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadModels = async () => {
    try {
      setLoadingModels(true);
      const { data } = await api.get("/playbench/models");
      const modelsList: AllowedModel[] = data.models || [];
      setAvailableModels(modelsList);
      if (modelsList.length > 0) {
        setSelectedModelId(modelsList[0].llm_id);
      }
    } catch (err) {
      console.error("Error loading models", err);
      setError("Unable to load available LLM models. Do you have active assignments?");
    } finally {
      setLoadingModels(false);
    }
  };

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const { data } = await api.get("/playbench/sessions");
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("Error loading sessions", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const currentModel = useMemo(() => {
    return availableModels.find((m) => m.llm_id === selectedModelId) || null;
  }, [availableModels, selectedModelId]);

  const totalTokens = useMemo(() => ({
    assigned: availableModels.reduce((s, m) => s + m.assigned_tokens, 0),
    used: availableModels.reduce((s, m) => s + m.used_tokens, 0),
    remaining: availableModels.reduce((s, m) => s + m.remaining_tokens, 0),
  }), [availableModels]);

  // ---------------------------
  // LOAD SESSION MESSAGES
  // ---------------------------
  const handleSelectSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    setStreamResponse("");
    setMessages([]);
    setError(null);

    try {
      setLoadingMessages(true);
      const { data } = await api.get(`/playbench/sessions/${sessionId}/messages`);
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Error loading messages", err);
      setError("Failed to load messages for this session.");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setStreamResponse("");
    setError(null);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/playbench/sessions/${sessionId}`);
      if (activeSessionId === sessionId) {
        handleNewChat();
      }
      await loadSessions();
    } catch (err) {
      console.error("Error deleting session", err);
    }
  };

  // ---------------------------
  // SEND MESSAGE (STREAM)
  // ---------------------------
  const handleSend = async () => {
    if (!prompt.trim() || !selectedModelId) return;
    if (currentModel && currentModel.remaining_tokens <= 0) {
      setError("Token quota exceeded for this model. Please contact your administrator.");
      return;
    }

    const currentPrompt = prompt;
    setPrompt("");
    setSending(true);
    setError(null);

    // Optimistically add user message to list
    const userMsg: PlaybenchMessage = { role: "user", content: currentPrompt };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Unable to obtain authentication token.");
      }

      setStreamResponse("...");

      const res = await fetch(`${API_BASE_URL}/playbench/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: currentPrompt,
          model: selectedModelId,
          session_id: activeSessionId,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        let parsedDetail = "Streaming request failed";
        try {
          const parsed = JSON.parse(errText);
          parsedDetail = parsed.detail || parsedDetail;
        } catch {
          parsedDetail = errText || parsedDetail;
        }
        throw new Error(parsedDetail);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("No response body available.");
      }
      const decoder = new TextDecoder();
      let fullAssistantText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const payload = line.replace("data: ", "").trim();
          if (payload === "[DONE]") continue;

          const json = JSON.parse(payload);
          if (json.token) {
            fullAssistantText += json.token;
            setStreamResponse(fullAssistantText);
          }

          if (json.done) {
            // Streaming finished successfully
            setActiveSessionId(json.session_id);
            // Append assistant message and clear stream temporary text
            setMessages((prev) => [...prev, { role: "assistant", content: json.full }]);
            setStreamResponse("");
            // Refresh models to get updated remaining token quotas, and reload sessions list
            await Promise.all([loadModels(), loadSessions()]);
          }
        }
      }
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message.");
      // Rollback last optimistic message if error occurred immediately
      setStreamResponse("");
    } finally {
      setSending(false);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 100px)", bgcolor: "#08080F", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
      
      {/* SIDEBAR FOR CHAT SESSIONS */}
      <Box sx={{ width: 260, borderRight: "1px solid rgba(255,255,255,0.08)", bgcolor: "#0F0F1A", display: "flex", flexDirection: "column" }}>
        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={handleNewChat}
            sx={{
              background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            New Chat
          </Button>
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
        
        <Box sx={{ flex: 1, overflowY: "auto", px: 1, py: 1.5 }}>
          <Typography sx={{ px: 1.5, mb: 1, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)" }}>
            CHAT HISTORY
          </Typography>
          {loadingSessions ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={20} />
            </Box>
          ) : sessions.length === 0 ? (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>No sessions yet</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {sessions.map((s) => (
                <ListItem
                  key={s.id}
                  disablePadding
                  secondaryAction={
                    s.is_own ? (
                      <IconButton edge="end" onClick={(e) => handleDeleteSession(s.id, e)} sx={{ color: "rgba(255,255,255,0.3)", "&:hover": { color: "#EF4444" } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    ) : null
                  }
                  sx={{ mb: 0.5 }}
                >
                  <ListItemButton
                    selected={activeSessionId === s.id}
                    onClick={() => handleSelectSession(s.id)}
                    sx={{
                      borderRadius: 1.5,
                      py: 1,
                      px: 1.5,
                      color: activeSessionId === s.id ? "#A855F7" : "rgba(255,255,255,0.7)",
                      bgcolor: activeSessionId === s.id ? "rgba(124,58,237,0.08)" : "transparent",
                      "&.Mui-selected": { bgcolor: "rgba(124,58,237,0.12)" },
                      "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
                    }}
                  >
                    <ForumIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                    <ListItemText
                      primary={s.display_name}
                      secondary={s.created_at ? new Date(s.created_at).toLocaleDateString() : ""}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: activeSessionId === s.id ? 600 : 500 }}
                      secondaryTypographyProps={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>

      {/* CHAT AREA */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#08080F" }}>
        
        {/* MODEL SELECTION & TOKEN QUOTA PANEL */}
        <Box sx={{ p: 2, borderBottom: "1px solid rgba(255,255,255,0.08)", bgcolor: "#0A0A12" }}>
          {/* Total tokens row — matches the Launchpad card */}
          {!loadingModels && availableModels.length > 0 && (
            <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                Total across all models:
              </Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: totalTokens.remaining > 0 ? "#10B981" : "#EF4444" }}>
                {totalTokens.remaining.toLocaleString()} remaining
              </Typography>
              <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                ({totalTokens.used.toLocaleString()} used of {totalTokens.assigned.toLocaleString()})
              </Typography>
            </Stack>
          )}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              {loadingModels ? (
                <CircularProgress size={20} />
              ) : (
                <TextField
                  select
                  label="Select AI Model"
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  fullWidth
                  size="small"
                  InputLabelProps={{ style: { color: "rgba(255,255,255,0.5)" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#fff",
                      backgroundColor: "rgba(255,255,255,0.03)",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                    },
                  }}
                >
                  {availableModels.map((m) => (
                    <MenuItem key={m.llm_id} value={m.llm_id}>
                      {m.display_name} ({m.provider.toUpperCase()})
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Grid>
            <Grid item xs={12} md={8}>
              {currentModel && (
                <Card sx={{ bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <CardContent sx={{ py: "8px !important", px: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase" }}>
                        Token Quota: {currentModel.display_name}
                      </Typography>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: currentModel.remaining_tokens > 0 ? "#10B981" : "#EF4444" }}>
                        {currentModel.remaining_tokens.toLocaleString()} tokens remaining
                      </Typography>
                    </Stack>
                    <Box sx={{ width: "100%", mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={currentModel.assigned_tokens > 0 ? (currentModel.remaining_tokens / currentModel.assigned_tokens) * 100 : 0}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: "rgba(255,255,255,0.05)",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 3,
                            background: "linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)",
                          },
                        }}
                      />
                    </Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                      <Typography sx={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                        Used: {currentModel.used_tokens.toLocaleString()} tokens
                      </Typography>
                      <Typography sx={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                        Allocated: {currentModel.assigned_tokens.toLocaleString()} tokens
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </Box>

        {/* CHAT MESSAGES DISPLAY */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
          {loadingMessages ? (
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress />
              <Typography sx={{ mt: 2, color: "rgba(255,255,255,0.5)" }}>Retrieving conversation history...</Typography>
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <SmartToyIcon sx={{ fontSize: 48, color: "rgba(255,255,255,0.15)", mb: 2 }} />
              <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.8)", mb: 1, fontWeight: 700 }}>
                Welcome to MotiveMinds Playbench
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 13, maxWidth: 400 }}>
                Select an assigned model above and start chatting. Your conversation tokens will count against your allocated quota.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2.5}>
              {messages.map((m, index) => (
                <Stack
                  key={index}
                  direction="row"
                  spacing={1.5}
                  justifyContent={m.role === "user" ? "flex-end" : "flex-start"}
                  alignItems="flex-start"
                >
                  {m.role === "assistant" && (
                    <Avatar sx={{ bgcolor: "rgba(124,58,237,0.15)", color: "#A855F7", width: 34, height: 34, border: "1px solid rgba(124,58,237,0.3)" }}>
                      <SmartToyIcon fontSize="small" />
                    </Avatar>
                  )}
                  <Card
                    sx={{
                      maxWidth: "70%",
                      bgcolor: m.role === "user" ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)",
                      border: "1px solid",
                      borderColor: m.role === "user" ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.06)",
                      borderRadius: m.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                      boxShadow: "none",
                    }}
                  >
                    <CardContent sx={{ py: "10px !important", px: "16px !important" }}>
                      <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {m.content}
                      </Typography>
                    </CardContent>
                  </Card>
                  {m.role === "user" && (
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "#fff", width: 34, height: 34 }}>
                      <PersonIcon fontSize="small" />
                    </Avatar>
                  )}
                </Stack>
              ))}

              {/* ACTIVE STREAM RESPONSE */}
              {streamResponse && (
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Avatar sx={{ bgcolor: "rgba(124,58,237,0.15)", color: "#A855F7", width: 34, height: 34, border: "1px solid rgba(124,58,237,0.3)" }}>
                    <SmartToyIcon fontSize="small" />
                  </Avatar>
                  <Card
                    sx={{
                      maxWidth: "70%",
                      bgcolor: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "20px 20px 20px 4px",
                      boxShadow: "none",
                    }}
                  >
                    <CardContent sx={{ py: "10px !important", px: "16px !important" }}>
                      <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {streamResponse}
                      </Typography>
                    </CardContent>
                  </Card>
                </Stack>
              )}

              <div ref={messagesEndRef} />
            </Stack>
          )}
        </Box>

        {/* ERROR / STATUS NOTIFICATIONS */}
        {error && (
          <Box sx={{ px: 3, pb: 1 }}>
            <Alert severity="error" variant="outlined" sx={{ color: "#EF4444", borderColor: "#EF4444", bgcolor: "rgba(239,68,68,0.05)" }}>
              {error}
            </Alert>
          </Box>
        )}

        {/* INPUT PANEL */}
        <Box sx={{ p: 3, borderTop: "1px solid rgba(255,255,255,0.08)", bgcolor: "#0A0A12" }}>
          <Stack direction="row" spacing={1.5}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder={
                currentModel && currentModel.remaining_tokens <= 0
                  ? "Daily/Monthly Token Quota Exceeded."
                  : "Type a prompt or task details..."
              }
              disabled={sending || (currentModel !== null && currentModel.remaining_tokens <= 0)}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              InputProps={{
                style: { color: "#fff" },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "rgba(255,255,255,0.03)",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                  "&.Mui-focused fieldset": { borderColor: "#A855F7" },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={sending || !prompt.trim() || (currentModel !== null && currentModel.remaining_tokens <= 0)}
              sx={{
                borderRadius: 3,
                px: 3,
                background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
                textTransform: "none",
                fontWeight: 700,
                "&:disabled": {
                  bgcolor: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.25)",
                },
              }}
            >
              {sending ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : <SendIcon />}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}