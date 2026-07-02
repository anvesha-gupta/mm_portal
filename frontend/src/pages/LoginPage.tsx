import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import useAuth from "../auth/useAuth";

const APP_ENV = (import.meta.env.VITE_APP_ENV || "local").toLowerCase();

export default function LoginPage() {
  const { login, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState("");

  const fromPath =
    (location.state as { from?: { pathname?: string } })?.from?.pathname ||
    sessionStorage.getItem("loginRedirectPath") ||
    "/dashboard";

  useEffect(() => {
    if (!authLoading && user) {
      const destination = fromPath === "/login" ? "/dashboard" : fromPath;
      sessionStorage.removeItem("loginRedirectPath");
      navigate(destination, { replace: true });
    }
  }, [user, authLoading, fromPath, navigate]);

  const handleMicrosoftLogin = async () => {
    const redirectPath =
      (location.state as { from?: { pathname?: string } })?.from?.pathname ||
      "/dashboard";

    sessionStorage.setItem("loginRedirectPath", redirectPath);
    try {
      await login();
    } catch (err: any) {
      setError(err.message || "Microsoft authentication failed");
    }
  };

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setError("");
    setLocalLoading(true);

    try {
      await login(username.trim(), password.trim());
    } catch (err: any) {
      setError(err.message || "Invalid credentials or server error");
    } finally {
      setLocalLoading(false);
    }
  };

  const isLocal = APP_ENV === "local";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#08080F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow Effects */}
      <Box
        sx={{
          position: "absolute",
          top: -200,
          left: -200,
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -150,
          right: -150,
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          bgcolor: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 6,
          p: 5,
          width: 430,
          textAlign: "center",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.15)",
        }}
      >
        <Stack alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              background:
                "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 24px rgba(124,58,237,0.5)",
            }}
          >
            <Typography sx={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>
              MM
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              sx={{
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: "-0.5px",
                color: "#fff",
              }}
            >
              Motive
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Minds
              </span>
            </Typography>
            <Typography
              sx={{
                fontSize: 10,
                color: "#C084FC",
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                mt: 0.5,
              }}
            >
              Intelligence Simplified
            </Typography>
          </Box>
        </Stack>

        <Typography
          sx={{
            fontSize: 13,
            color: "rgba(255,255,255,0.7)",
            fontStyle: "italic",
            mb: 4,
          }}
        >
          Employee Hub · Internal Portal ({isLocal ? "Local Dev" : "Prod"})
        </Typography>

        {error && (
          <Alert
            severity="error"
            variant="outlined"
            sx={{
              mb: 3,
              textAlign: "left",
              color: "#f44336",
              borderColor: "rgba(244, 67, 54, 0.3)",
              bgcolor: "rgba(244, 67, 54, 0.05)",
            }}
          >
            {error}
          </Alert>
        )}

        {isLocal ? (
          <Box component="form" onSubmit={handleLocalLogin}>
            <Stack spacing={2.5}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={localLoading || authLoading}
                InputLabelProps={{ style: { color: "rgba(255,255,255,0.6)" } }}
                inputProps={{
                  style: { color: "#fff", backgroundColor: "transparent" },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255,255,255,0.02)",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                    "&:hover fieldset": {
                      borderColor: "rgba(124, 58, 237, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#7C3AED",
                    },
                  },
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={localLoading || authLoading}
                InputLabelProps={{ style: { color: "rgba(255,255,255,0.6)" } }}
                inputProps={{
                  style: { color: "#fff", backgroundColor: "transparent" },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "rgba(255,255,255,0.6)" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255,255,255,0.02)",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                    "&:hover fieldset": {
                      borderColor: "rgba(124, 58, 237, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#7C3AED",
                    },
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={localLoading || authLoading}
                sx={{
                  py: 1.75,
                  fontSize: 15,
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)",
                  },
                }}
              >
                {localLoading ? "Logging in..." : "Sign In"}
              </Button>
            </Stack>

            <Typography
              sx={{
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                mt: 3,
                borderTop: "1px solid rgba(255,255,255,0.08)",
                pt: 2.5,
              }}
            >
              Demo: Sign in with <strong>admin</strong> and password <strong>abc</strong>
            </Typography>
          </Box>
        ) : (
          <Box>
            <Button
              onClick={handleMicrosoftLogin}
              disabled={authLoading}
              variant="contained"
              fullWidth
              sx={{
                py: 1.75,
                gap: 1.5,
                borderRadius: 2,
                backgroundColor: "#fff",
                color: "#1a1a2e",
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.9)",
                },
              }}
            >
              Sign in with Microsoft
            </Button>
            <Typography
              sx={{ fontSize: 12, color: "rgba(255,255,255,0.6)", mt: 2 }}
            >
              Sign in with corporate Azure Active Directory using your Microsoft
              account.
            </Typography>
          </Box>
        )}

        <Typography
          sx={{ fontSize: 10, color: "rgba(255,255,255,0.45)", mt: 4 }}
        >
          Azure AD · SAML 2.0 / OAuth 2.0 · SOC 2 Type II
        </Typography>
        <Typography
          sx={{
            fontSize: 10,
            color: "rgba(255,255,255,0.45)",
            mt: 1,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#10B981",
            }}
          />
          Secure SSO · All access keys server-side only
        </Typography>
      </Box>
    </Box>
  );
}