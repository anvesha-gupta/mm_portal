import { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import {
  accessService,
  ALL_APPS,
  ALL_ROLES,
  RolePermissionResponse,
} from "../../services/accessService";
import useAuth from "../../auth/useAuth";

export default function RoleAccessMatrix() {
  const { refreshPermissions } = useAuth();
  const [permissions, setPermissions] = useState<RolePermissionResponse[]>([]);
  const [dirty, setDirty] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const rp = await accessService.getRolePermissions();
        setPermissions(rp);
      } catch (err) {
        console.error("Failed to load role permissions", err);
      }
    }
    loadData();
  }, []);

  function isPermitted(roleId: string, appId: string): boolean {
    return permissions.some(
      (p) => p.role_id === roleId && p.app_id === appId
    );
  }

  function togglePermission(roleId: string, appId: string) {
    setPermissions((prev) => {
      const exists = prev.some((p) => p.role_id === roleId && p.app_id === appId);
      let updated: RolePermissionResponse[];
      
      if (exists) {
        updated = prev.filter((p) => !(p.role_id === roleId && p.app_id === appId));
      } else {
        updated = [...prev, { role_id: roleId, app_id: appId }];
      }
      
      return updated;
    });
    setDirty(true);
  }

  async function savePermissions() {
    try {
      await accessService.saveRolePermissions(permissions);
      await refreshPermissions(); // refresh active session permissions
      setDirty(false);
      setToastMsg("Role permissions saved successfully.");
      setToastOpen(true);
    } catch (err) {
      console.error(err);
      setToastMsg("Error saving role permissions.");
      setToastOpen(true);
    }
  }

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        background: "#171726",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <div>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ color: "#fff" }}
          >
            Role Access Matrix
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Configure which applications each role can access.
          </Typography>
        </div>

        <Button
          variant="contained"
          disabled={!dirty}
          onClick={savePermissions}
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
          Save Role Permissions
        </Button>
      </Stack>

      <Table>
        <TableHead>
          <TableRow sx={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>
              Application
            </TableCell>

            {ALL_ROLES.map((role) => (
              <TableCell
                key={role.id}
                align="center"
                sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 700 }}
              >
                {role.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {ALL_APPS.map((app) => (
            <TableRow
              key={app.id}
              sx={{
                "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                {app.name}
              </TableCell>

              {ALL_ROLES.map((role) => (
                <TableCell
                  key={`${role.id}-${app.id}`}
                  align="center"
                >
                  <Checkbox
                    checked={isPermitted(role.id, app.id)}
                    onChange={() => togglePermission(role.id, app.id)}
                    sx={{
                      color: "rgba(255,255,255,0.3)",
                      "&.Mui-checked": {
                        color: "#A855F7",
                      },
                    }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toastMsg.includes("Error") ? "error" : "success"}
          onClose={() => setToastOpen(false)}
          sx={{ width: "100%", bgcolor: "#1E1E38", color: "#fff" }}
        >
          {toastMsg}
        </Alert>
      </Snackbar>
    </Paper>
  );
}