import { NavLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

import useAuth from "../auth/useAuth";

const navItems = [
  {
    label: "Launchpad",
    path: "/dashboard",
  },
  {
    label: "AI Playbench",
    path: "/playbench",
    badge: "New",
  },
  {
    label: "Swag Store",
    path: "/swag",
    badge: "750",
  },
  {
    label: "Apps",
    path: "/apps",
  },
  {
    label: "Track Points",
    path: "/leaderboard",
  },
  {
    label: "Profile",
    path: "/profile",
  },
  {
    label: "Settings",
    path: "/settings",
  },
  {
    label: "Access Management",
    path: "/admin",
  },
  {
    label: "Future Systems",
    path: "/future",
  },
];

const pathPermissionMap: Record<string, string> = {
  "/playbench": "playbench",
  "/leaderboard": "leaderboard",
  "/admin": "admin",
};

function Sidebar() {
  const { user, hasPermission } = useAuth();

  const visibleItems = navItems.filter((item) => {
    const appId = pathPermissionMap[item.path];
    if (!appId) return true; // public path for logged-in users
    return hasPermission(appId);
  });

  const workspaceItems = visibleItems.filter((item) =>
    ["/dashboard", "/playbench", "/swag", "/apps"].includes(item.path)
  );

  const peopleItems = visibleItems.filter((item) =>
    ["/leaderboard", "/profile", "/settings"].includes(item.path)
  );

  const adminItems = visibleItems.filter((item) =>
    item.path === "/admin"
  );

  const roadmapItems = visibleItems.filter((item) =>
    ["/future"].includes(item.path)
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
      {/* ====================================================== */}
      {/* LOGO */}
      {/* ====================================================== */}

      <Box sx={{ mb: 3, px: 1 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              background:
                "linear-gradient(135deg,#7C3AED,#A855F7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow:
                "0 0 16px rgba(124,58,237,.5)",
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
                fontWeight: 800,
                fontSize: 14,
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

      <Box sx={{ flex: 1, overflowY: "auto" }}>
                {/* ====================================================== */}
        {/* WORKSPACE */}
        {/* ====================================================== */}

        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.42)",
            px: 1,
            mb: 1,
          }}
        >
          Workspace
        </Typography>

        {workspaceItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{ textDecoration: "none" }}
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

                <Typography>{item.label}</Typography>

                {item.badge && (
                  <Box
                    sx={{
                      ml: "auto",
                      px: 1,
                      py: 0.3,
                      borderRadius: 99,
                      background:
                        item.path === "/swag"
                          ? "rgba(245,158,11,.15)"
                          : "linear-gradient(135deg,#7C3AED,#A855F7)",
                      color:
                        item.path === "/swag"
                          ? "#000"
                          : "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {item.badge}
                  </Box>
                )}
              </Box>
            )}
          </NavLink>
        ))}

        {/* ====================================================== */}
        {/* PEOPLE */}
        {/* ====================================================== */}

        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.42)",
            px: 1,
            mt: 2,
            mb: 1,
          }}
        >
          People
        </Typography>

        {peopleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{ textDecoration: "none" }}
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

                <Typography>{item.label}</Typography>
              </Box>
            )}
          </NavLink>
        ))}
                {/* ====================================================== */}
        {/* ROADMAP */}
        {/* ====================================================== */}

        {roadmapItems.length > 0 && (
          <>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.42)",
                px: 1,
                mt: 2,
                mb: 1,
              }}
            >
              Roadmap
            </Typography>

            {roadmapItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={{ textDecoration: "none" }}
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
                        opacity: 0.4,
                      }}
                    />
                    <Typography>{item.label}</Typography>
                  </Box>
                )}
              </NavLink>
            ))}
          </>
        )}

        {/* ====================================================== */}
        {/* ADMIN */}
        {/* ====================================================== */}

        {adminItems.length > 0 && (
          <>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.42)",
                px: 1,
                mt: 2,
                mb: 1,
              }}
            >
              Administration
            </Typography>

            {adminItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={{ textDecoration: "none" }}
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

                    <Typography>{item.label}</Typography>
                  </Box>
                )}
              </NavLink>
            ))}
          </>
        )}
      </Box>

      <Divider
        sx={{
          borderColor: "rgba(255,255,255,0.08)",
        }}
      />

      {/* ====================================================== */}
      {/* USER */}
      {/* ====================================================== */}

      <Box sx={{ mt: 2, px: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: 2,
            p: 1,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "#7C3AED",
              width: 34,
              height: 34,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              noWrap
              sx={{
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {user?.name || "User"}
            </Typography>

            <Typography
              noWrap
              sx={{
                fontSize: 10,
                color: "rgba(255,255,255,0.6)",
                textTransform: "capitalize",
              }}
            >
              {user?.role}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

export default Sidebar;