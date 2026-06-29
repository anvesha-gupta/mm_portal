import { useEffect, useMemo, useState } from 'react';
import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import {
  createUserOverride,
  deleteUserOverride,
  getApps,
  getRoles,
  getUserOverrides,
  getUsers,
  updateUserOverride,
  UserOverrideRow,
  AppRow,
  RoleRow,
  UserRow,
} from '../../services/adminApi';

const defaultForm = {
  user_id: '',
  app_id: '',
  override_type: 'grant' as 'grant' | 'revoke',
  granted_by: '',
};

function OverridesTab() {
  const [overrides, setOverrides] = useState<UserOverrideRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState<UserOverrideRow | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const [deleteId, setDeleteId] = useState<GridRowId | null>(null);

  useEffect(() => {
    async function loadAll() {
      try {
        const [overrideData, userData, appData] = await Promise.all([getUserOverrides(), getUsers(), getApps()]);
        setOverrides(overrideData);
        setUsers(userData);
        setApps(appData);
      } catch {
        setSnackbar({ message: 'Unable to load override data.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: 'user_id', headerName: 'User', flex: 1, minWidth: 180, valueGetter: (params) => params.row.user_id },
      { field: 'app_id', headerName: 'App', flex: 1, minWidth: 160, valueGetter: (params) => params.row.app_id },
      { field: 'override_type', headerName: 'Type', flex: 0.9, minWidth: 120 },
      { field: 'granted_by', headerName: 'Granted By', flex: 1, minWidth: 150 },
      { field: 'created_at', headerName: 'Created', flex: 1, minWidth: 170 },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 180,
        sortable: false,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleEdit(params.id.toString())}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.16)' }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => setDeleteId(params.id)}
              sx={{ borderColor: 'rgba(255,255,255,0.16)' }}
            >
              Remove
            </Button>
          </Box>
        ),
      },
    ],
    []
  );

  const refreshOverrides = async () => {
    try {
      setLoading(true);
      const data = await getUserOverrides();
      setOverrides(data);
    } catch {
      setSnackbar({ message: 'Unable to refresh overrides.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    const row = overrides.find((item) => item.id === id);
    if (!row) return;
    setEditRow(row);
    setForm({
      user_id: row.user_id,
      app_id: row.app_id,
      override_type: row.override_type,
      granted_by: row.granted_by ?? '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setEditRow(null);
    setForm(defaultForm);
    setOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        user_id: form.user_id,
        app_id: form.app_id,
        override_type: form.override_type,
        granted_by: form.granted_by || undefined,
      };

      if (editRow) {
        await updateUserOverride(editRow.id, payload);
        setSnackbar({ message: 'Override updated successfully.', severity: 'success' });
      } else {
        await createUserOverride(payload);
        setSnackbar({ message: 'Override created successfully.', severity: 'success' });
      }

      handleClose();
      await refreshOverrides();
    } catch {
      setSnackbar({ message: 'Unable to save override.', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteUserOverride(deleteId.toString());
      setSnackbar({ message: 'Override removed.', severity: 'success' });
      setDeleteId(null);
      await refreshOverrides();
    } catch {
      setSnackbar({ message: 'Unable to remove override.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Box component="h2" sx={{ color: '#fff', fontSize: 18, mb: 0.5 }}>User Overrides</Box>
          <Box sx={{ color: 'rgba(255,255,255,0.7)' }}>Grant or revoke access to applications per user.</Box>
        </Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Override
        </Button>
      </Box>

      <Paper sx={{ height: 580, bgcolor: '#090A14', border: '1px solid rgba(255,255,255,0.08)' }}>
        {loading ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={overrides}
            columns={columns}
            getRowId={(row) => row.id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ border: 'none', color: '#fff', '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(255,255,255,0.08)' } }}
          />
        )}
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editRow ? 'Edit Override' : 'Add Override'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="User"
                value={form.user_id}
                onChange={(event) => setForm({ ...form, user_id: event.target.value })}
                fullWidth
                margin="dense"
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.display_name} • {user.email}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Application"
                value={form.app_id}
                onChange={(event) => setForm({ ...form, app_id: event.target.value })}
                fullWidth
                margin="dense"
              >
                {apps.map((app) => (
                  <MenuItem key={app.id} value={app.id}>
                    {app.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Override"
                value={form.override_type}
                onChange={(event) => setForm({ ...form, override_type: event.target.value as 'grant' | 'revoke' })}
                fullWidth
                margin="dense"
              >
                <MenuItem value="grant">Grant</MenuItem>
                <MenuItem value="revoke">Revoke</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Granted By"
                value={form.granted_by}
                onChange={(event) => setForm({ ...form, granted_by: event.target.value })}
                fullWidth
                margin="dense"
              >
                <MenuItem value="">None</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.display_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirm Remove</DialogTitle>
        <DialogContent>Remove this user override from the system.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar?.severity ?? 'success'}>{snackbar?.message ?? ''}</Alert>
      </Snackbar>
    </Box>
  );
}

export default OverridesTab;
