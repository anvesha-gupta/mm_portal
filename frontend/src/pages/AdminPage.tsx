import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

import PageHeader from "../components/PageHeader";
import RoleAccessMatrix from "../components/admin/RoleAccessMatrix";
import UserOverridePanel from "../components/admin/UserOverridePanel";

export default function AdminPage() {
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
        title="Access Management"
        subtitle="Manage application access for roles and individual employees."
      />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <RoleAccessMatrix />
        </Grid>
        <Grid item xs={12}>
          <UserOverridePanel />
        </Grid>
      </Grid>
    </Box>
  );
}