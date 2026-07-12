import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import PageHeader from "../components/PageHeader";
import useAuth from "../auth/useAuth";
import api from "../services/api";

type HistoryItem = {
  employee: string;
  change: string;
  reason: string;
  date: string;
};

type LeaderboardEntry = {
  name: string;
  points: number;
  isCurrentUser?: boolean;
};

const HISTORY_KEY = "mm_points_history";
const LEADERBOARD_KEY = "mm_leaderboard";

type DbUser = { id: string; display_name: string; role_id: string };


const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { name: "Rahul Sharma", points: 7250 },
  { name: "Jane Smith",   points: 6840 },
  { name: "John Doe",     points: 6400 },
  { name: "You",          points: 5100, isCurrentUser: true },
];

const DEFAULT_HISTORY: HistoryItem[] = [
  { employee: "Rahul Sharma", change: "+250", reason: "Customer Appreciation", date: "24 Jul" },
  { employee: "Jane Smith",   change: "-100", reason: "Late Submission",       date: "23 Jul" },
  { employee: "John Doe",     change: "+500", reason: "Innovation Bonus",      date: "22 Jul" },
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const isHR = user?.role === "hr";
  const currentUserName = user?.name ?? "You";

  const [tab, setTab] = useState(0);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() =>
    loadFromStorage(LEADERBOARD_KEY, DEFAULT_LEADERBOARD)
  );

  const [history, setHistory] = useState<HistoryItem[]>(() =>
    loadFromStorage(HISTORY_KEY, DEFAULT_HISTORY)
  );

  const [dbUsers, setDbUsers] = useState<DbUser[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [pointsInput, setPointsInput] = useState("");
  const [reason, setReason] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    api.get<DbUser[]>("/api/users/directory").then((res) => setDbUsers(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  }, [leaderboard]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const displayLeaderboard = leaderboard
    .map((e) => (e.isCurrentUser ? { ...e, name: currentUserName } : e))
    .sort((a, b) => b.points - a.points);

  const handleAward = async () => {
    const emp = dbUsers.find((u) => u.id === selectedEmployee);
    const pts = parseInt(pointsInput, 10);

    if (!emp || !pts || pts <= 0 || !reason.trim()) {
      setErrorMsg("Please fill in all fields with valid values.");
      return;
    }

    try {
      await api.post(`/api/user_points/${emp.id}/award`, {
        points: pts,
        reason: reason.trim(),
      });

      setLeaderboard((prev) =>
        prev.map((e) => (e.name === emp.display_name ? { ...e, points: e.points + pts } : e))
      );

      const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      setHistory((prev) => [
        { employee: emp.display_name, change: `+${pts}`, reason: reason.trim(), date: dateStr },
        ...prev,
      ]);

      setSelectedEmployee("");
      setPointsInput("");
      setReason("");
      setErrorMsg("");
      setSuccessMsg(`${pts} points awarded to ${emp.display_name} successfully!`);
      setTimeout(() => {
        setSuccessMsg("");
        setTab(0);
      }, 1500);
    } catch {
      setErrorMsg("Failed to award points. Please try again.");
    }
  };

  return (
    <Box sx={{ pt: 10, px: 3, pb: 4 }}>
      <PageHeader
        title="Track Points"
        subtitle="Monitor employee recognition and reward points."
      />

      <Paper sx={{ mt: 3, bgcolor: "#171722", borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab label="Leaderboard" />
          {isHR && <Tab label="Award Points" />}
          {isHR && <Tab label="History" />}
        </Tabs>

        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography sx={{ color: "white", fontSize: 22, fontWeight: 700, mb: 3 }}>
              Employee Leaderboard
            </Typography>
            <TableContainer component={Paper} sx={{ bgcolor: "#1E1E2D", borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#C084FC", fontWeight: 700 }}>Rank</TableCell>
                    <TableCell sx={{ color: "#C084FC", fontWeight: 700 }}>Employee</TableCell>
                    <TableCell align="right" sx={{ color: "#C084FC", fontWeight: 700 }}>Points</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayLeaderboard.map((employee, index) => (
                    <TableRow key={employee.name} hover>
                      <TableCell sx={{ color: "white" }}>#{index + 1}</TableCell>
                      <TableCell sx={{ color: "white" }}>{employee.name}</TableCell>
                      <TableCell align="right" sx={{ color: "#4ADE80", fontWeight: 700 }}>
                        {employee.points.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {isHR && tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography sx={{ color: "white", fontSize: 22, fontWeight: 700, mb: 3 }}>
              Award Points
            </Typography>

            {successMsg && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg("")}>
                {successMsg}
              </Alert>
            )}
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMsg("")}>
                {errorMsg}
              </Alert>
            )}

            <Stack spacing={3} maxWidth={500}>
              <TextField
                select
                fullWidth
                label="Employee"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                InputLabelProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
                sx={{ "& .MuiOutlinedInput-root": { color: "white", bgcolor: "#1E1E2D" } }}
              >
                {dbUsers.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.display_name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Points"
                type="number"
                placeholder="250"
                value={pointsInput}
                onChange={(e) => setPointsInput(e.target.value)}
                inputProps={{ min: 1 }}
                InputLabelProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
                sx={{ "& .MuiOutlinedInput-root": { color: "white", bgcolor: "#1E1E2D" } }}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Reason"
                placeholder="Excellent customer appreciation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                InputLabelProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
                sx={{ "& .MuiOutlinedInput-root": { color: "white", bgcolor: "#1E1E2D" } }}
              />

              <Button
                variant="contained"
                size="large"
                onClick={handleAward}
                sx={{
                  width: 220,
                  height: 50,
                  borderRadius: 3,
                  fontWeight: 700,
                  textTransform: "none",
                  background: "linear-gradient(135deg,#7C3AED,#A855F7)",
                  "&:hover": { background: "linear-gradient(135deg,#6D28D9,#9333EA)" },
                }}
              >
                Award Points
              </Button>
            </Stack>
          </Box>
        )}

        {isHR && tab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography sx={{ color: "white", fontSize: 22, fontWeight: 700, mb: 3 }}>
              Points History
            </Typography>
            <TableContainer component={Paper} sx={{ bgcolor: "#1E1E2D", borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#C084FC", fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ color: "#C084FC", fontWeight: 700 }}>Employee</TableCell>
                    <TableCell sx={{ color: "#C084FC", fontWeight: 700 }}>Change</TableCell>
                    <TableCell sx={{ color: "#C084FC", fontWeight: 700 }}>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((item, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ color: "white" }}>{item.date}</TableCell>
                      <TableCell sx={{ color: "white" }}>{item.employee}</TableCell>
                      <TableCell sx={{ color: item.change.startsWith("+") ? "#4ADE80" : "#EF4444", fontWeight: 700 }}>
                        {item.change}
                      </TableCell>
                      <TableCell sx={{ color: "white" }}>{item.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
