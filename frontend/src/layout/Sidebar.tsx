import { NavLink } from "react-router-dom";
import useAuth from "../auth/useAuth";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

type NavItem = {
  label: string;
  path: string;
  badge?: string;
  roles: ("employee" | "finance" | "hr" | "admin")[];
};

const navItems: NavItem[] = [
  // ===========================
  // Workspace
  // ===========================

  {
    label: "Launchpad",
    path: "/dashboard",
    roles: ["employee", "finance", "hr", "admin"],
  },

  {
    label: "AI Playbench",
    path: "/playbench",
    badge: "New",
    roles: ["employee", "finance", "hr", "admin"],
  },

  {
    label: "Apps",
    path: "/apps",
    roles: ["employee", "finance", "hr", "admin"],
  },

  // ===========================
  // Account
  // ===========================

  {
    label: "Swag Store",
    path: "/swag",
    badge: "750",
    roles: ["employee", "finance", "hr", "admin"],
  },

  {
    label: "Track Points",
    path: "/leaderboard",
    roles: ["hr"],
  },

  {
    label: "Profile",
    path: "/profile",
    roles: ["employee", "finance", "hr", "admin"],
  },

  {
    label: "Settings",
    path: "/settings",
    roles: ["employee", "finance", "hr", "admin"],
  },

  {
    label: "Admin",
    path: "/admin",
    roles: ["admin"],
  },
];

function Sidebar() {
  const { user } = useAuth();

  const role = user?.role ?? "employee";

  const visibleItems = navItems.filter((item) =>
    item.roles.includes(role)
  );

  const workspaceItems = visibleItems.filter((item) =>
    ["/dashboard", "/playbench", "/apps"].includes(item.path)
  );

  const accountItems = visibleItems.filter((item) =>
    [
      "/swag",
      "/leaderboard",
      "/profile",
      "/settings",
      "/admin",
    ].includes(item.path)
  );

  const renderItem = (item: NavItem) => (
    <NavLink
      key={item.path}
      to={item.path}
      style={{
        textDecoration: "none",
      }}
    >
      {({ isActive }) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
            px: 1.5,
            py: 1,
            borderRadius: 1,

            color: isActive
              ? "#A855F7"
              : "rgba(255,255,255,0.75)",

            backgroundColor: isActive
              ? "rgba(124,58,237,0.12)"
              : "transparent",

            fontWeight: isActive ? 600 : 500,

            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.05)",
            },
          }}
        >
          <Box
            sx={{
              width: 18,
              height: 18,
              borderRadius: 0.5,
              backgroundColor: "currentColor",
              opacity: 0.7,
            }}
          />

          <Typography sx={{ fontSize: 14 }}>
            {item.label}
          </Typography>

          {item.badge && (
            <Box
              sx={{
                ml: "auto",
                px: 1,
                py: 0.3,
                borderRadius: 99,
                fontSize: 10,
                fontWeight: 700,

                background:
                  item.path === "/swag"
                    ? "rgba(245,158,11,0.18)"
                    : "linear-gradient(135deg,#7C3AED,#A855F7)",

                color:
                  item.path === "/swag"
                    ? "#F59E0B"
                    : "#fff",
              }}
            >
              {item.badge}
            </Box>
          )}
        </Box>
      )}
    </NavLink>
  ); 
   return (
    <Box
      component="aside"
      sx={{
        width: 230,
        minHeight: "100vh",
        backgroundColor: "#0F0F1A",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        p: 2,
        flexShrink: 0,
      }}
    >
      {/* ===========================
          Logo
      =========================== */}

      <Box sx={{ mb: 3, px: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              background:
                "linear-gradient(135deg,#7C3AED,#A855F7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 0 16px rgba(124,58,237,0.5)",
            }}
          >
            <Typography
              sx={{
                color: "#fff",
                fontWeight: 900,
                fontSize: 14,
              }}
            >
              MM
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              MotiveMinds
            </Typography>

            <Typography
              sx={{
                fontSize: 10,
                color: "#C084FC",
                textTransform: "uppercase",
              }}
            >
              Hub
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* ===========================
          Navigation
      =========================== */}

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".1em",
            color: "rgba(255,255,255,.42)",
            textTransform: "uppercase",
            px: 1,
            mb: 1,
          }}
        >
          Workspace
        </Typography>

        {workspaceItems.map(renderItem)}

        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".1em",
            color: "rgba(255,255,255,.42)",
            textTransform: "uppercase",
            px: 1,
            mt: 2,
            mb: 1,
          }}
        >
          Account
        </Typography>

        {accountItems.map(renderItem)}
                <Typography
          sx={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".1em",
            color: "rgba(255,255,255,.42)",
            textTransform: "uppercase",
            px: 1,
            mt: 2,
            mb: 1,
          }}
        >
          Roadmap
        </Typography>

        <NavLink
          to="/future"
          style={{
            textDecoration: "none",
          }}
        >
          {({ isActive }) => (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1,
                px: 1.5,
                py: 1,
                borderRadius: 1,

                color: isActive
                  ? "#A855F7"
                  : "rgba(255,255,255,0.42)",

                backgroundColor: isActive
                  ? "rgba(124,58,237,0.12)"
                  : "transparent",

                "&:hover": {
                  backgroundColor:
                    "rgba(255,255,255,0.05)",
                },
              }}
            >
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: 0.5,
                  backgroundColor: "currentColor",
                  opacity: 0.4,
                }}
              />

              <Typography>
                Future Systems
              </Typography>
            </Box>
          )}
        </NavLink>
      </Box>

      <Divider
        sx={{
          borderColor: "rgba(255,255,255,0.08)",
        }}
      />

      <Box
        sx={{
          mt: 2,
          px: 1,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: 2,
            p: 1,
          }}
        >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: "#7C3AED",
              fontWeight: 700,
            }}
          >
            {(user?.name ?? "Demo User")
              .split(" ")
              .map((word) => word[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()}
          </Avatar>

          <Box>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {user?.name ?? "Demo User"}
            </Typography>

            <Typography
              sx={{
                fontSize: 10,
                color: "rgba(255,255,255,0.60)",
                textTransform: "capitalize",
              }}
            >
              {role === "employee"
                ? "Standard Employee"
                : role === "finance"
                ? "Finance"
                : role === "hr"
                ? "Human Resources"
                : "IT Administrator"}
            </Typography>
          </Box>
        </Stack>
      </Box>
          </Box>
  );
}

export default Sidebar;