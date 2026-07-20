import { NavLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import AppsIcon from "@mui/icons-material/Apps";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ExploreIcon from "@mui/icons-material/Explore";
import { SvgIconComponent } from "@mui/icons-material";

import useAuth from "../auth/useAuth";
import { usePoints } from "../context/PointsContext";

const navItems: { label: string; path: string; badge?: string; Icon: SvgIconComponent }[] = [
  { label: "Launchpad",         path: "/dashboard",  Icon: RocketLaunchIcon },
  { label: "AI Playbench",      path: "/playbench",  Icon: SmartToyIcon,            badge: "New" },
  { label: "Swag Store",        path: "/swag",       Icon: CardGiftcardIcon,        badge: "750" },
  { label: "Apps",              path: "/apps",       Icon: AppsIcon },
  { label: "Track Points",      path: "/leaderboard",Icon: LeaderboardIcon },
  { label: "Profile",           path: "/profile",    Icon: PersonIcon },
  { label: "Settings",          path: "/settings",   Icon: SettingsIcon },
  { label: "Access Management", path: "/admin",      Icon: AdminPanelSettingsIcon },
  { label: "Future Systems",    path: "/future",     Icon: ExploreIcon },
];

const pathPermissionMap: Record<string, string> = {
  "/playbench":  "playbench",
  "/leaderboard": "leaderboard",
  "/admin":      "admin",
};

function NavSection({
  label,
  items,
  isDark,
}: {
  label: string;
  items: typeof navItems;
  isDark: boolean;
}) {
  if (!items.length) return null;
  return (
    <>
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.38)",
          px: 1,
          mt: 2,
          mb: 1,
        }}
      >
        {label}
      </Typography>
      {items.map((item) => (
        <NavLink key={item.path} to={item.path} style={{ textDecoration: "none" }}>
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
                  : isDark
                  ? "rgba(255,255,255,0.75)"
                  : "rgba(0,0,0,0.65)",
                backgroundColor: isActive ? "rgba(124,58,237,0.12)" : "transparent",
                fontWeight: isActive ? 600 : 500,
                "&:hover": {
                  backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                },
              }}
            >
              <item.Icon sx={{ fontSize: 18, flexShrink: 0, opacity: 0.85 }} />
              <Typography sx={{ fontSize: 13 }}>{item.label}</Typography>
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
                    color: item.path === "/swag" ? "#92400e" : "#fff",
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
    </>
  );
}

function Sidebar() {
  const { user, hasPermission } = useAuth();
  const { balance } = usePoints();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const visibleItems = navItems.filter((item) => {
    const appId = pathPermissionMap[item.path];
    if (!appId) return true;
    return hasPermission(appId);
  });

  const workspaceItems = visibleItems.filter((item) =>
    ["/dashboard", "/playbench", "/swag", "/apps"].includes(item.path)
  );
  const peopleItems = visibleItems.filter((item) =>
    ["/leaderboard", "/profile", "/settings"].includes(item.path)
  );
  const adminItems  = visibleItems.filter((item) => item.path === "/admin");
  const roadmapItems = visibleItems.filter((item) => ["/future"].includes(item.path));

  return (
    <Box
      component="aside"
      sx={{
        width: 230,
        minHeight: "100vh",
        backgroundColor: isDark ? "#0F0F1A" : "#F0F0F8",
        borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)"}`,
        display: "flex",
        flexDirection: "column",
        p: 2,
        flexShrink: 0,
      }}
    >
      {/* LOGO */}
      <Box sx={{ mb: 3, px: 1 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              background: "linear-gradient(135deg,#7C3AED,#A855F7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 0 16px rgba(124,58,237,.4)",
            }}
          >
            <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>MM</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 14, color: "text.primary" }}>
              MotiveMinds
            </Typography>
            <Typography sx={{ fontSize: 10, color: "#A855F7", textTransform: "uppercase" }}>
              Hub
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* NAV */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <NavSection label="Workspace" items={workspaceItems} isDark={isDark} />
        <NavSection label="People"    items={peopleItems}    isDark={isDark} />
        <NavSection label="Roadmap"   items={roadmapItems}   isDark={isDark} />
        <NavSection label="Administration" items={adminItems} isDark={isDark} />
      </Box>

      <Divider sx={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)" }} />

      {/* USER CARD */}
      <Box sx={{ mt: 2, px: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{
            backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            borderRadius: 2,
            p: 1,
          }}
        >
          <Avatar sx={{ bgcolor: "#7C3AED", width: 34, height: 34, fontSize: 14, fontWeight: 700 }}>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography noWrap sx={{ fontSize: 12, fontWeight: 600, color: "text.primary" }}>
              {user?.name || "User"}
            </Typography>
            <Typography
              noWrap
              sx={{
                fontSize: 10,
                color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.50)",
                textTransform: "capitalize",
              }}
            >
              {user?.role}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: "#A855F7",
              whiteSpace: "nowrap",
            }}
          >
            {balance.toLocaleString()} pts
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

export default Sidebar;
