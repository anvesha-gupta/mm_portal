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
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import {
  createRole,
  deleteRole,
  getRoles,
  updateRole,
  RoleRow,
} from '../../services/adminApi';

const defaultForm = {
  id: '',
  label: '',
  description: '',
};

function RolesTab() {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState<RoleRow | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const [deleteId, setDeleteId] = useState<GridRowId | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getRoles();
        setRoles(data);
      } catch {
        setSnackbar({ message: 'Unable to load roles.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: 'id', headerName: 'Role ID', flex: 0.7, minWidth: 120 },
      { field: 'label', headerName: 'Label', flex: 1, minWidth: 160 },
      { field: 'description', headerName: 'Description', flex: 1.5, minWidth: 220 },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 160,
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
              Delete
            </Button>
          </Box>
        ),
      },
    ],
    []
  );

  const refreshRoles = async () => {
    try {
      setLoading(true);
      const data = await getRoles();
      setRoles(data);
    } catch {
      setSnackbar({ message: 'Unable to refresh roles.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    const row = roles.find((item) => item.id === id);
    if (!row) return;
    setEditRow(row);
    setForm({ id: row.id, label: row.label, description: row.description ?? '' });
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
        id: form.id,
        label: form.label,
        description: form.description || undefined,
      };

      if (editRow) {
        await updateRole(editRow.id, payload);
        setSnackbar({ message: 'Role updated successfully.', severity: 'success' });
      } else {
        await createRole(payload);
        setSnackbar({ message: 'Role created successfully.', severity: 'success' });
      }

      handleClose();
      await refreshRoles();
    } catch {
      setSnackbar({ message: 'Unable to save role.', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteRole(deleteId.toString());
      setSnackbar({ message: 'Role deleted.', severity: 'success' });
      setDeleteId(null);
      await refreshRoles();
    } catch {
      setSnackbar({ message: 'Unable to delete role.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Box component="h2" sx={{ color: '#fff', fontSize: 18, mb: 0.5 }}>Role Management</Box>
          <Box sx={{ color: 'rgba(255,255,255,0.7)' }}>Create and manage application roles used for authorization.</Box>
        </Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Role
        </Button>
      </Box>

      <Paper sx={{ height: 580, bgcolor: '#090A14', border: '1px solid rgba(255,255,255,0.08)' }}>
        {loading ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={roles}
            columns={columns}
            getRowId={(row) => row.id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ border: 'none', color: '#fff', '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(255,255,255,0.08)' } }}
          />
        )}
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editRow ? 'Edit Role' : 'Add Role'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Role ID"
                value={form.id}
                onChange={(event) => setForm({ ...form, id: event.target.value })}
                fullWidth
                disabled={Boolean(editRow)}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Label"
                value={form.label}
                onChange={(event) => setForm({ ...form, label: event.target.value })}
                fullWidth
                margin="dense"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                fullWidth
                multiline
                rows={3}
                margin="dense"
              />
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
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this role? This will remove it from any assigned users.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
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

export default RolesTab;
