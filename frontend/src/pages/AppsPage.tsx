import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

import PageHeader from "../components/PageHeader";
import AppCard from "../components/AppCard";

import useAuth from "../auth/useAuth";

type AppItem = {
  id: string;
  icon: string;
  title: string;
  type: string;

  external: boolean;

  bg: string;

  url?: string;

  link?: string;

  allowedRoles: (
    | "employee"
    | "finance"
    | "hr"
    | "admin"
  )[];
};

export const appItems: AppItem[] = [  {
    id: "wyngs",
    icon: "🛫",
    title: "Wyngs",
    type: "Internal",
    external: true,
    bg: "rgba(124,58,237,0.18)",
    url: "https://motiveminds.wyngs.pro/app/home",
    allowedRoles: ["employee", "finance", "hr", "admin"],
  },

  {
    id: "estimatrix",
    icon: "📊",
    title: "Estimatrix",
    type: "Internal",
    external: true,
    bg: "rgba(16,185,129,0.18)",
    url: "https://estdev.wyngs.pro/",
    allowedRoles: ["finance", "admin"],
  },

  {
    id: "myra",
    icon: "🤖",
    title: "MyRA",
    type: "Internal",
    external: false,
    bg: "rgba(168,85,247,0.18)",
    link: "/myra",
    allowedRoles: ["admin"],
  },

  // ===============================
  // AI TOOLS
  // ===============================

  {
    id: "mindscript",
    icon: "🧠",
    title: "Mindscript",
    type: "AI Tool",
    external: false,
    bg: "rgba(99,102,241,0.18)",
    link: "/mindscript",
    allowedRoles: ["admin"],
  },

  {
    id: "resolve-iq",
    icon: "🧩",
    title: "Resolve IQ",
    type: "AI Tool",
    external: false,
    bg: "rgba(14,165,233,0.18)",
    link: "/resolve-iq",
    allowedRoles: ["admin"],
  },

  // ===============================
  // FUTURE MODULES
  // ===============================

  {
    id: "expense-management",
    icon: "💰",
    title: "Expense Management",
    type: "Future Module",
    external: false,
    bg: "rgba(34,197,94,0.18)",
    link: "/expense-management",
    allowedRoles: ["finance", "admin"],
  },

  {
    id: "knowledge-management",
    icon: "📚",
    title: "Knowledge Management",
    type: "Future Module",
    external: false,
    bg: "rgba(168,85,247,0.18)",
    link: "/knowledge-management",
    allowedRoles: ["hr"],
  },

  {
    id: "idea-tracking",
    icon: "💡",
    title: "Idea Tracking",
    type: "Future Module",
    external: false,
    bg: "rgba(250,204,21,0.18)",
    link: "/idea-tracking",
    allowedRoles: ["hr"],
  },

  // ===============================
  // SaaS Applications
  // ===============================

  {
    id: "keka",
    icon: "🏢",
    title: "Keka",
    type: "SaaS",
    external: true,
    bg: "rgba(56,189,248,0.15)",
    url: "https://app.keka.com/Account/Login?ReturnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fresponse_type%3Dcode%26client_id%3D987cc971-fc22-4454-99f9-16c078fa7ff6%26state%3DaTM5RDA4YmdYVWJJNF95dVU5bmEuTWI2VDdSajRveG4zbDlEdi5Vbl85LnNr%26redirect_uri%3Dhttps%253A%252F%252Fmotiveminds.keka.com%26scope%3Dopenid%2520offline_access%2520kekahr.api%2520hiro.api%26code_challenge%3DiQ3UcfF4-1EBNwyiQSX0-m1DwsEdOWN_t5Eo6gw85bs%26code_challenge_method%3DS256%26nonce%3DaTM5RDA4YmdYVWJJNF95dVU5bmEuTWI2VDdSajRveG4zbDlEdi5Vbl85LnNr",
    allowedRoles: ["employee", "finance", "hr", "admin"],
  },

  {
    id: "salesforce",
    icon: "☁️",
    title: "Salesforce",
    type: "SaaS",
    external: true,
    bg: "rgba(56,189,248,0.15)",
    url: "https://www.salesforce.com/in/?ir=1",
    allowedRoles: ["employee", "finance", "hr", "admin"],
  },

  {
    id: "zohobooks",
    icon: "📒",
    title: "Zoho Books",
    type: "SaaS",
    external: true,
    bg: "rgba(16,185,129,0.18)",
    url: "https://zohobooks.placeholder.com",
    allowedRoles: ["finance", "admin"],
  },

  {
    id: "admin",
    icon: "🛡️",
    title: "Admin Panel",
    type: "Internal",
    external: false,
    bg: "rgba(239,68,68,0.15)",
    link: "/admin",
    allowedRoles: ["admin"],
  },

  {
    id: "gitlab",
    icon: "🦊",
    title: "GitLab",
    type: "SaaS",
    external: true,
    bg: "rgba(245,158,11,0.18)",
    url: "https://github.com/enterprises/motiveminds-consulting-pvt-ltd/sso",
    allowedRoles: ["admin"],
  },
];
function AppsPage() {
  const { hasPermission } = useAuth();

  const visibleApps = appItems.filter((app) =>
    hasPermission(app.id)
  );

  return (
    <Box
      sx={{
        pt: 10,
        pl: 3,
        pr: 3,
        pb: 4,
        minHeight: "100vh",
      }}
    >
      <PageHeader
        title="Applications"
        subtitle="Applications available for your role."
      />

      <Grid container spacing={2}>
        {visibleApps.map((app) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={app.id}
          >
            <AppCard
              id={app.id}
              icon={app.icon}
              title={app.title}
              type={app.type}
              external={app.external}
              background={app.bg}
              link={app.link}
              url={app.url}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default AppsPage;