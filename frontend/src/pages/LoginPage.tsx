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
      const destination =
        fromPath === "/login"
          ? "/dashboard"
          : fromPath;

      sessionStorage.removeItem("loginRedirectPath");

      navigate(destination, {
        replace: true,
      });
    }
  }, [user, authLoading, fromPath, navigate]);

  const handleMicrosoftLogin = async () => {
    setError("");

    try {
      // Step 2:
      // Later this will call the backend with the selected role.
      console.log("Selected role:", role);

      await login(role);
    } catch (err: any) {
        console.error(err);

        setError(
           err?.message ||
           JSON.stringify(err, null, 2) ||
           "Unable to sign in."
        );
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#08080F",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -220,
          left: -220,
          width: 650,
          height: 650,
          background:
            "radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: -200,
          right: -200,
          width: 550,
          height: 550,
          background:
            "radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)",
        }}
      />

      <Box
        sx={{
          width: 430,
          p: 5,
          borderRadius: 6,
          bgcolor: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.15)",
        }}
      >
        <Stack
          spacing={1}
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              background:
                "linear-gradient(135deg,#7C3AED,#A855F7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                color: "white",
                fontWeight: 700,
                fontSize: 22,
              }}
            >
              MM
            </Typography>
          </Box>

          <Typography
            sx={{
              color: "#fff",
              fontWeight: 800,
              fontSize: 26,
            }}
          >
            Motive
            <span
              style={{
                background:
                  "linear-gradient(135deg,#7C3AED,#A855F7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Minds
            </span>
          </Typography>

          <Typography
            sx={{
              color: "#C084FC",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            Intelligence Simplified
          </Typography>
        </Stack>

        <Typography
          align="center"
          sx={{
            color: "rgba(255,255,255,0.65)",
            mb: 4,
          }}
        >
          Select your role to continue
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}       
         <FormControl
          fullWidth
          sx={{
            mb: 4,
          }}
        >
          <InputLabel
            sx={{
              color: "rgba(255,255,255,0.65)",
              "&.Mui-focused": {
                color: "#A855F7",
              },
            }}
          >
            Select Role
          </InputLabel>

          <Select
            value={role}
            label="Select Role"
            onChange={(e) => setRole(e.target.value)}
            sx={{
              color: "white",
              borderRadius: 3,

              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,0.18)",
              },

              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#A855F7",
              },

              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#A855F7",
              },

              "& .MuiSvgIcon-root": {
                color: "white",
              },
            }}

            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: "#181825",
                  color: "white",
                },
              },
            }}
          >
            <MenuItem value="employee">
              Standard Employee
            </MenuItem>

            <MenuItem value="finance">
              Finance
            </MenuItem>

            <MenuItem value="hr">
              Human Resources (HR)
            </MenuItem>

            <MenuItem value="admin">
              IT Administrator
            </MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={authLoading}
          onClick={handleMicrosoftLogin}
          sx={{
            height: 56,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 700,
            fontSize: 16,
            background:
              "linear-gradient(135deg,#7C3AED,#A855F7)",

            boxShadow:
              "0 12px 30px rgba(124,58,237,0.35)",

            transition: "0.25s",

            "&:hover": {
              transform: "translateY(-2px)",
              background:
                "linear-gradient(135deg,#6D28D9,#9333EA)",
            },

            "&:disabled": {
              background: "#666",
              color: "#DDD",
            },
          }}
        >
          {authLoading
            ? "Signing In..."
            : "Sign in with Microsoft"}
        </Button>

        <Typography
          align="center"
          sx={{
            mt: 4,
            color: "rgba(255,255,255,0.55)",
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          This is a demonstration login.
          <br />
          Choose your portal role before signing in.
        </Typography>

        <Typography
          align="center"
          sx={{
            mt: 4,
            color: "rgba(255,255,255,0.35)",
            fontSize: 11,
          }}
        >
          © {new Date().getFullYear()} MotiveMinds
        </Typography>

      </Box>
    </Box>
  );
}