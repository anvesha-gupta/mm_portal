import { useState } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import {
  accessService,
  ALL_APPS,
  ALL_ROLES,
  UserResponse,
  UserAppOverrideResponse,
  RolePermissionResponse,
} from "../../services/accessService";
import useAuth from "../../auth/useAuth";

export default function UserOverridePanel() {
  const { user: currentUser, refreshPermissions } = useAuth();

  const [employeeId, setEmployeeId] = useState("");
  const [employee, setEmployee] = useState<UserResponse | null>(null);
  
  // Custom states to manage overrides
  const [rolePermissions, setRolePermissions] = useState<RolePermissionResponse[]>([]);
  const [initialOverrides, setInitialOverrides] = useState<UserAppOverrideResponse[]>([]);
  const [tempOverrides, setTempOverrides] = useState<Record<string, "grant" | "revoke" | null>>({});
  
  const [dirty, setDirty] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  async function searchEmployee() {
    if (!employeeId.trim()) return;

    try {
      const found = await accessService.getUserByEmployeeId(employeeId);
      if (!found) {
        setToastMsg("Employee not found.");
        setToastOpen(true);
        setEmployee(null);
        return;
      }

      // Load all role permissions and overrides for this user
      const [allRp, userOvs] = await Promise.all([
        accessService.getRolePermissions(),
        accessService.getUserOverrides(found.id),
      ]);

      setEmployee(found);
      setRolePermissions(allRp);
      setInitialOverrides(userOvs);

      // Construct a dictionary of initial overrides: appId -> type
      const dict: Record<string, "grant" | "revoke" | null> = {};
      ALL_APPS.forEach((app) => {
        const foundOv = userOvs.find((o) => o.app_id === app.id);
        dict[app.id] = foundOv ? foundOv.override_type : null;
      });

      setTempOverrides(dict);
      setDirty(false);
    } catch (err) {
      console.error(err);
      setToastMsg("Error loading employee data.");
      setToastOpen(true);
    }
  }

  function getRoleLabel(roleId: string): string {
    const roleObj = ALL_ROLES.find((r) => r.id === roleId);
    return roleObj ? roleObj.label : roleId;
  }

  // Does the employee's role naturally have access?
  function isInheritedAllowed(appId: string): boolean {
    if (!employee) return false;
    return rolePermissions.some(
      (p) => p.role_id === employee.role_id && p.app_id === appId
    );
  }

  // Is access currently allowed considering overrides?
  function isAccessAllowed(appId: string): boolean {
    const override = tempOverrides[appId];
    if (override !== undefined && override !== null) {
      return override === "grant";
    }
    return isInheritedAllowed(appId);
  }

  function handleToggleApp(appId: string) {
    if (!employee) return;

    const inherited = isInheritedAllowed(appId);
    const currentlyAllowed = isAccessAllowed(appId);
    const newAllowed = !currentlyAllowed;

    setTempOverrides((prev) => {
      const updated = { ...prev };
      
      // Determine what the override should be to achieve 'newAllowed' state
      if (newAllowed === inherited) {
        // Returned to natural role state -> override is removed
        updated[appId] = null;
      } else {
        // State differs from role -> override required
        updated[appId] = newAllowed ? "grant" : "revoke";
      }

      // Check if dirty by comparing with initial overrides
      const isStillDirty = ALL_APPS.some((app) => {
        const initOv = initialOverrides.find((o) => o.app_id === app.id)?.override_type ?? null;
        return updated[app.id] !== initOv;
      });

      setDirty(isStillDirty);
      return updated;
    });
  }

  async function saveOverrides() {
    if (!employee) return;

    try {
      // Map dictionary back to list of active overrides
      const payload: { app_id: string; override_type: "grant" | "revoke" }[] = [];
      Object.entries(tempOverrides).forEach(([appId, type]) => {
        if (type) {
          payload.push({ app_id: appId, override_type: type });
        }
      });

      await accessService.saveUserOverrides(employee.id, payload);

      // If we modified overrides for the currently logged-in user, refresh their session state
      if (employee.id === currentUser?.id) {
        await refreshPermissions();
      }

      // Re-read to reset initial baseline
      const freshOverrides = await accessService.getUserOverrides(employee.id);
      setInitialOverrides(freshOverrides);
      setDirty(false);

      setToastMsg("User overrides saved successfully.");
      setToastOpen(true);
    } catch (err) {
      console.error(err);
      setToastMsg("Error saving overrides.");
      setToastOpen(true);
    }
  }

  function getBadge(appId: string) {
    const override = tempOverrides[appId];
    if (override === "grant") {
      return (
        <Chip
          label="Override (Granted)"
          size="small"
          sx={{
            bgcolor: "rgba(16,185,129,0.15)",
            color: "#10B981",
            border: "1px solid rgba(16,185,129,0.3)",
            fontWeight: 600,
          }}
        />
      );
    }
    if (override === "revoke") {
      return (
        <Chip
          label="Override (Revoked)"
          size="small"
          sx={{
            bgcolor: "rgba(239,68,68,0.15)",
            color: "#EF4444",
            border: "1px solid rgba(239,68,68,0.3)",
            fontWeight: 600,
          }}
        />
      );
    }
    const inherited = isInheritedAllowed(appId);
    if (inherited) {
      return (
        <Chip
          label="Inherited (Allowed)"
          size="small"
          sx={{
            bgcolor: "rgba(124,58,237,0.1)",
            color: "#C084FC",
            border: "1px solid rgba(124,58,237,0.2)",
            fontWeight: 500,
          }}
        />
      );
    }
    return (
      <Chip
        label="Inherited (Denied)"
        size="small"
        sx={{
          bgcolor: "rgba(255,255,255,0.04)",
          color: "rgba(255,255,255,0.4)",
          border: "1px solid rgba(255,255,255,0.08)",
          fontWeight: 500,
        }}
      />
    );
  }

  return (
    <Paper
      sx={{
        p: 3,
        mt: 3,
        borderRadius: 3,
        background: "#171726",
        border: "1px solid rgba(255,255,255,.08)",
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ color: "#fff" }}
      >
        User Overrides
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        mb={3}
      >
        Grant or revoke applications for a specific employee without changing their role.
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        mb={3}
      >
        <TextField
          fullWidth
          label="Employee ID (e.g. EMP001)"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") searchEmployee();
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
              "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
              "&.Mui-focused fieldset": { borderColor: "#A855F7" },
            },
            "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
            "& .MuiInputLabel-root.Mui-focused": { color: "#A855F7" },
            "& .MuiOutlinedInput-input": { color: "#fff" },
          }}
        />

        <Button
          variant="contained"
          onClick={searchEmployee}
          sx={{
            background: "linear-gradient(135deg, #7C3AED, #A855F7)",
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
          }}
        >
          Search
        </Button>
      </Stack>

      <Divider sx={{ mb: 3, borderColor: "rgba(255,255,255,0.08)" }} />

      {employee && (
        <>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            mb={2}
            sx={{ color: "#fff" }}
          >
            Employee Details
          </Typography>

          <Grid
            container
            spacing={2}
            mb={3}
          >
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Employee Name"
                value={employee.display_name}
                disabled
                sx={{
                  "& .MuiOutlinedInput-root.Mui-disabled fieldset": {
                    borderColor: "rgba(255,255,255,0.08)",
                  },
                  "& .MuiOutlinedInput-input.Mui-disabled": {
                    color: "rgba(255,255,255,0.7)",
                    WebkitTextFillColor: "rgba(255,255,255,0.7)",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Employee ID"
                value={employee.id}
                disabled
                sx={{
                  "& .MuiOutlinedInput-root.Mui-disabled fieldset": {
                    borderColor: "rgba(255,255,255,0.08)",
                  },
                  "& .MuiOutlinedInput-input.Mui-disabled": {
                    color: "rgba(255,255,255,0.7)",
                    WebkitTextFillColor: "rgba(255,255,255,0.7)",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Current Role"
                value={getRoleLabel(employee.role_id)}
                disabled
                sx={{
                  "& .MuiOutlinedInput-root.Mui-disabled fieldset": {
                    borderColor: "rgba(255,255,255,0.08)",
                  },
                  "& .MuiOutlinedInput-input.Mui-disabled": {
                    color: "rgba(255,255,255,0.7)",
                    WebkitTextFillColor: "rgba(255,255,255,0.7)",
                  },
                }}
              />
            </Grid>
          </Grid>

          <Typography
            variant="subtitle1"
            fontWeight={700}
            mb={2}
            sx={{ color: "#fff" }}
          >
            Application Access & Custom Overrides
          </Typography>

          <Grid
            container
            spacing={2}
          >
            {ALL_APPS.map((app) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={app.id}
              >
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    transition: "0.2s",

                    "&:hover": {
                      bgcolor: "rgba(124,58,237,0.04)",
                      borderColor: "rgba(124,58,237,0.2)",
                    },
                  }}
                >
                  <div>
                    <Typography
                      fontWeight={600}
                      sx={{ color: "#fff", mb: 0.5 }}
                    >
                      {app.name}
                    </Typography>
                    {getBadge(app.id)}
                  </div>

                  <Checkbox
                    checked={isAccessAllowed(app.id)}
                    onChange={() => handleToggleApp(app.id)}
                    sx={{
                      color: "rgba(255,255,255,0.3)",
                      "&.Mui-checked": {
                        color: "#A855F7",
                      },
                    }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Stack
            direction="row"
            justifyContent="flex-end"
            mt={4}
          >
            <Button
              variant="contained"
              disabled={!dirty}
              onClick={saveOverrides}
              sx={{
                background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                color: "#fff",
                textTransform: "none",
                fontWeight: 600,
                "&.Mui-disabled": {
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.3)",
                },
              }}
            >
              Save User Overrides
            </Button>
          </Stack>
        </>
      )}

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toastMsg.includes("not found") || toastMsg.includes("Error") ? "error" : "success"}
          onClose={() => setToastOpen(false)}
          sx={{ width: "100%", bgcolor: "#1E1E38", color: "#fff" }}
        >
          {toastMsg}
        </Alert>
      </Snackbar>
    </Paper>
  );
}