import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import PageHeader from "../components/PageHeader";
import useAuth from "../auth/useAuth";
import { accessService } from "../services/accessService";

export default function LeaderboardPage() {
  const { user } = useAuth();

  const isHR = user?.role === "hr";

  const [tab, setTab] = useState(0);

  // States for awarding points
  const [targetEmployeeId, setTargetEmployeeId] = useState("");
  const [pointsToAward, setPointsToAward] = useState("");
  const [awardReason, setAwardReason] = useState("");

  // Feedback states
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");

  const handleAwardPoints = async () => {
    if (!targetEmployeeId.trim()) {
      setToastMsg("Please enter an Employee ID.");
      setToastSeverity("error");
      setToastOpen(true);
      return;
    }
    if (!pointsToAward.trim() || isNaN(Number(pointsToAward)) || Number(pointsToAward) <= 0) {
      setToastMsg("Please enter a valid positive number for points.");
      setToastSeverity("error");
      setToastOpen(true);
      return;
    }
    if (!awardReason.trim()) {
      setToastMsg("Please enter a reason.");
      setToastSeverity("error");
      setToastOpen(true);
      return;
    }

    try {
      const emp = await accessService.getUserByEmployeeId(targetEmployeeId);
      if (!emp) {
        setToastMsg(`Employee with ID "${targetEmployeeId}" not found.`);
        setToastSeverity("error");
        setToastOpen(true);
        return;
      }

      setToastMsg(`Successfully awarded ${pointsToAward} points to ${emp.display_name} (${emp.id}).`);
      setToastSeverity("success");
      setToastOpen(true);

      // Reset form
      setTargetEmployeeId("");
      setPointsToAward("");
      setAwardReason("");
    } catch (err) {
      console.error(err);
      setToastMsg("Failed to award points.");
      setToastSeverity("error");
      setToastOpen(true);
    }
  };

  const leaderboard = [
    {
      name: "Rahul Sharma",
      points: 7250,
    },
    {
      name: "Jane Smith",
      points: 6840,
    },
    {
      name: "John Doe",
      points: 6400,
    },
    {
      name: user?.name ?? "You",
      points: 5100,
    },
  ];

  const history = [
    {
      employee: "Rahul Sharma",
      change: "+250",
      reason: "Customer Appreciation",
      date: "24 Jul",
    },
    {
      employee: "Jane Smith",
      change: "-100",
      reason: "Late Submission",
      date: "23 Jul",
    },
    {
      employee: "John Doe",
      change: "+500",
      reason: "Innovation Bonus",
      date: "22 Jul",
    },
  ];

  return (
    <Box
      sx={{
        pt: 10,
        px: 3,
        pb: 4,
      }}
    >
      <PageHeader
        title="Track Points"
        subtitle="Monitor employee recognition and reward points."
      />

      <Paper
        sx={{
          mt: 3,
          bgcolor: "#171722",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
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
                {/* =======================================================
            LEADERBOARD TAB
        ======================================================== */}

        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography
              sx={{
                color: "white",
                fontSize: 22,
                fontWeight: 700,
                mb: 3,
              }}
            >
              Employee Leaderboard
            </Typography>

            <TableContainer
              component={Paper}
              sx={{
                bgcolor: "#1E1E2D",
                borderRadius: 2,
              }}
            >
              <Table>

                <TableHead>
                  <TableRow>

                    <TableCell
                      sx={{
                        color: "#C084FC",
                        fontWeight: 700,
                      }}
                    >
                      Rank
                    </TableCell>

                    <TableCell
                      sx={{
                        color: "#C084FC",
                        fontWeight: 700,
                      }}
                    >
                      Employee
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        color: "#C084FC",
                        fontWeight: 700,
                      }}
                    >
                      Points
                    </TableCell>

                  </TableRow>
                </TableHead>

                <TableBody>

                  {leaderboard.map((employee, index) => (

                    <TableRow
                      key={employee.name}
                      hover
                    >

                      <TableCell
                        sx={{ color: "white" }}
                      >
                        #{index + 1}
                      </TableCell>

                      <TableCell
                        sx={{ color: "white" }}
                      >
                        {employee.name}
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          color: "#4ADE80",
                          fontWeight: 700,
                        }}
                      >
                        {employee.points}
                      </TableCell>

                    </TableRow>

                  ))}

                </TableBody>

              </Table>
            </TableContainer>
          </Box>
        )}
                {/* =======================================================
            AWARD POINTS TAB (HR ONLY)
        ======================================================== */}

        {isHR && tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography
              sx={{
                color: "white",
                fontSize: 22,
                fontWeight: 700,
                mb: 3,
              }}
            >
              Award Points
            </Typography>

            <Stack spacing={3} maxWidth={500}>

              <TextField
                fullWidth
                label="Employee ID (e.g. EMP001)"
                placeholder="EMP001"
                value={targetEmployeeId}
                onChange={(e) => setTargetEmployeeId(e.target.value)}
                InputLabelProps={{
                  sx: {
                    color: "rgba(255,255,255,0.6)",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    bgcolor: "#1E1E2D",
                  },
                }}
              />

              <TextField
                fullWidth
                label="Points"
                type="number"
                placeholder="250"
                value={pointsToAward}
                onChange={(e) => setPointsToAward(e.target.value)}
                InputLabelProps={{
                  sx: {
                    color: "rgba(255,255,255,0.6)",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    bgcolor: "#1E1E2D",
                  },
                }}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Reason"
                placeholder="Excellent customer appreciation..."
                value={awardReason}
                onChange={(e) => setAwardReason(e.target.value)}
                InputLabelProps={{
                  sx: {
                    color: "rgba(255,255,255,0.6)",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    bgcolor: "#1E1E2D",
                  },
                }}
              />

              <Button
                variant="contained"
                size="large"
                onClick={handleAwardPoints}
                sx={{
                  width: 220,
                  height: 50,
                  borderRadius: 3,
                  fontWeight: 700,
                  textTransform: "none",
                  background:
                    "linear-gradient(135deg,#7C3AED,#A855F7)",

                  "&:hover": {
                    background:
                      "linear-gradient(135deg,#6D28D9,#9333EA)",
                  },
                }}
              >
                Award Points
              </Button>

            </Stack>
          </Box>
        )}
                {/* =======================================================
            HISTORY TAB (HR ONLY)
        ======================================================== */}

        {isHR && tab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography
              sx={{
                color: "white",
                fontSize: 22,
                fontWeight: 700,
                mb: 3,
              }}
            >
              Points History
            </Typography>

            <TableContainer
              component={Paper}
              sx={{
                bgcolor: "#1E1E2D",
                borderRadius: 2,
              }}
            >
              <Table>

                <TableHead>
                  <TableRow>

                    <TableCell
                      sx={{
                        color: "#C084FC",
                        fontWeight: 700,
                      }}
                    >
                      Date
                    </TableCell>

                    <TableCell
                      sx={{
                        color: "#C084FC",
                        fontWeight: 700,
                      }}
                    >
                      Employee
                    </TableCell>

                    <TableCell
                      sx={{
                        color: "#C084FC",
                        fontWeight: 700,
                      }}
                    >
                      Change
                    </TableCell>

                    <TableCell
                      sx={{
                        color: "#C084FC",
                        fontWeight: 700,
                      }}
                    >
                      Reason
                    </TableCell>

                  </TableRow>
                </TableHead>

                <TableBody>

                  {history.map((item, index) => (

                    <TableRow key={index} hover>

                      <TableCell sx={{ color: "white" }}>
                        {item.date}
                      </TableCell>

                      <TableCell sx={{ color: "white" }}>
                        {item.employee}
                      </TableCell>

                      <TableCell
                        sx={{
                          color:
                            item.change.startsWith("+")
                              ? "#4ADE80"
                              : "#EF4444",
                          fontWeight: 700,
                        }}
                      >
                        {item.change}
                      </TableCell>

                      <TableCell sx={{ color: "white" }}>
                        {item.reason}
                      </TableCell>

                    </TableRow>

                  ))}

                </TableBody>

              </Table>
            </TableContainer>
          </Box>
        )}

      </Paper>

      <Snackbar
        open={toastOpen}
        autoHideDuration={4500}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toastSeverity}
          onClose={() => setToastOpen(false)}
          sx={{ width: "100%", bgcolor: "#1E1E38", color: "#fff" }}
        >
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}