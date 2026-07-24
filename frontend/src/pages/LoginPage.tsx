import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import useAuth from "../auth/useAuth";

function BgTriangles() {
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1440 900"
    >
      <polygon points="0,0 380,0 0,380" fill="rgba(124,58,237,0.05)" />
      <polygon points="1440,0 1060,0 1440,380" fill="rgba(168,85,247,0.05)" />
      <polygon points="0,900 360,900 0,540" fill="rgba(168,85,247,0.04)" />
      <polygon points="1440,900 1080,900 1440,540" fill="rgba(124,58,237,0.04)" />
      <polygon points="720,120 920,480 520,480" fill="rgba(124,58,237,0.025)" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" style={{ display: "block" }}>
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

const IS_LOCAL = import.meta.env.VITE_APP_ENV === "local";

export default function LoginPage() {
  const { login, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState("");
  const [role, setRole] = useState("employee");

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
    setError("");
    try {
      await login(IS_LOCAL ? role : undefined);
    } catch (err: any) {
      setError(err?.message || JSON.stringify(err, null, 2) || "Unable to sign in.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#06060E",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glows */}
      <Box sx={{ position: "absolute", top: -240, left: -240, width: 720, height: 720, background: "radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 65%)", pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", bottom: -220, right: -220, width: 640, height: 640, background: "radial-gradient(circle, rgba(168,85,247,0.16) 0%, transparent 65%)", pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 1000, height: 700, background: "radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <BgTriangles />

      {/* Card */}
      <Box
        sx={{
          position: "relative",
          width: 460,
          borderRadius: "20px",
          overflow: "hidden",
          bgcolor: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(36px)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow:
            "0 48px 120px rgba(0,0,0,0.75), 0 0 0 1px rgba(124,58,237,0.22), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        {/* Top gradient accent bar */}
        <Box
          sx={{
            height: 3,
            background: "linear-gradient(90deg, #5B21B6 0%, #7C3AED 30%, #A855F7 70%, #7C3AED 100%)",
          }}
        />

        {/* Main body */}
        <Box sx={{ px: "44px", pt: "40px", pb: "32px" }}>

          {/* Branding block */}
          <Stack alignItems="center" spacing={0} sx={{ mb: "36px" }}>
            {/* Logo mark + wordmark row */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
              {/* Triangle icon matching the brand mark */}
              <svg width="36" height="36" viewBox="0 0 44 44">
                {/* Two small triangles stacked on the left */}
                <polygon points="0,2 13,11 0,20"  fill="rgba(255,255,255,0.95)" />
                <polygon points="0,24 13,33 0,42" fill="rgba(255,255,255,0.95)" />
                {/* One large triangle on the right */}
                <polygon points="18,0 44,22 18,44" fill="rgba(255,255,255,0.95)" />
              </svg>
              <Typography sx={{ color: "#fff", fontWeight: 400, fontSize: 32, letterSpacing: "-0.02em", lineHeight: 1 }}>
                motiveminds
              </Typography>
            </Stack>

            {/* Tagline */}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: "12px" }}>
              <Box sx={{ width: 36, height: "1px", bgcolor: "rgba(255,255,255,0.15)" }} />
              <Typography sx={{ color: "#A855F7", fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase" }}>
                Intelligence Simplified
              </Typography>
              <Box sx={{ width: 36, height: "1px", bgcolor: "rgba(255,255,255,0.15)" }} />
            </Stack>
          </Stack>

          {/* Form heading */}
          <Typography
            align="center"
            sx={{ color: "rgba(255,255,255,0.5)", fontSize: 13, mb: "24px" }}
          >
            {IS_LOCAL
              ? "Select your portal role to continue"
              : "Sign in with your Microsoft account"}
          </Typography>

          {/* Error */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                bgcolor: "rgba(239,68,68,0.08)",
                color: "#FCA5A5",
                border: "1px solid rgba(239,68,68,0.2)",
                "& .MuiAlert-icon": { color: "#F87171" },
              }}
            >
              {error}
            </Alert>
          )}

          {/* Role selector — local dev only */}
          {IS_LOCAL && (
            <FormControl fullWidth sx={{ mb: "20px" }}>
              <InputLabel
                sx={{
                  color: "rgba(255,255,255,0.45)",
                  "&.Mui-focused": { color: "#A855F7" },
                }}
              >
                Portal Role
              </InputLabel>
              <Select
                value={role}
                label="Portal Role"
                onChange={(e) => setRole(e.target.value)}
                sx={{
                  color: "white",
                  borderRadius: "10px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.11)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(124,58,237,0.55)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#7C3AED",
                    borderWidth: "1.5px",
                  },
                  "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.45)" },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: "#0F0F1C",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "10px",
                      color: "white",
                      mt: 0.5,
                      "& .MuiMenuItem-root": {
                        fontSize: 14,
                        py: 1.25,
                      },
                      "& .MuiMenuItem-root:hover": {
                        bgcolor: "rgba(124,58,237,0.14)",
                      },
                      "& .MuiMenuItem-root.Mui-selected": {
                        bgcolor: "rgba(124,58,237,0.22)",
                      },
                    },
                  },
                }}
              >
                <MenuItem value="employee">Standard Employee</MenuItem>
                <MenuItem value="finance">Finance</MenuItem>
                <MenuItem value="hr">Human Resources (HR)</MenuItem>
                <MenuItem value="admin">IT Administrator</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Sign-in button */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            disabled={authLoading}
            onClick={handleMicrosoftLogin}
            startIcon={!authLoading ? <MicrosoftIcon /> : undefined}
            sx={{
              height: 52,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: "0.01em",
              background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
              boxShadow: "0 8px 28px rgba(124,58,237,0.42)",
              transition: "all 0.22s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 14px 36px rgba(124,58,237,0.54)",
                background: "linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)",
              },
              "&:active": { transform: "translateY(0)" },
              "&:disabled": {
                background: "rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.28)",
                boxShadow: "none",
              },
            }}
          >
            {authLoading ? "Signing In…" : "Continue with Microsoft"}
          </Button>

          {/* Trust badge */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={0.75}
            sx={{ mt: "20px" }}
          >
            <Box
              component="svg"
              viewBox="0 0 24 24"
              sx={{ width: 13, height: 13, fill: "rgba(255,255,255,0.28)", flexShrink: 0 }}
            >
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 14-3-3 1.41-1.41L11 12.17l4.59-4.58L17 9l-6 6z" />
            </Box>
            <Typography sx={{ color: "rgba(255,255,255,0.28)", fontSize: 11.5 }}>
              Secured with Microsoft Identity Platform
            </Typography>
          </Stack>
        </Box>

        {/* Footer bar */}
        <Box
          sx={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            bgcolor: "rgba(0,0,0,0.25)",
            px: "44px",
            py: "14px",
            textAlign: "center",
          }}
        >
          <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>
            © {new Date().getFullYear()} MotiveMinds Consulting Pvt Ltd. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
