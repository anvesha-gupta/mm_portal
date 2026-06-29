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
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  UserRow,
} from '../../services/adminApi';

const defaultForm = {
  id: '',
  email: '',
  display_name: '',
  department: '',
  title: '',
  azure_oid: '',
  role_id: '',
  is_active: true,
};

const roles = ['admin', 'employee', 'manager', 'hr'];

function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState<UserRow | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const [deleteId, setDeleteId] = useState<GridRowId | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        setSnackbar({ message: 'Unable to load users.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
      { field: 'display_name', headerName: 'Name', flex: 1, minWidth: 160 },
      { field: 'department', headerName: 'Department', flex: 1, minWidth: 140 },
      { field: 'title', headerName: 'Title', flex: 1, minWidth: 130 },
      { field: 'role_id', headerName: 'Role', flex: 0.8, minWidth: 110 },
      { field: 'is_active', headerName: 'Active', width: 100, type: 'boolean' },
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

  const refreshUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch {
      setSnackbar({ message: 'Unable to refresh users.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    const row = users.find((item) => item.id === id);
    if (!row) return;
    setEditRow(row);
    setForm({
      id: row.id,
      email: row.email,
      display_name: row.display_name,
      department: row.department ?? '',
      title: row.title ?? '',
      azure_oid: row.azure_oid ?? '',
      role_id: row.role_id ?? '',
      is_active: row.is_active,
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
        email: form.email,
        display_name: form.display_name,
        department: form.department || undefined,
        title: form.title || undefined,
        azure_oid: form.azure_oid || undefined,
        role_id: form.role_id || undefined,
        is_active: form.is_active,
      };

      if (editRow) {
        await updateUser(editRow.id, payload);
        setSnackbar({ message: 'User updated successfully.', severity: 'success' });
      } else {
        await createUser(payload);
        setSnackbar({ message: 'User created successfully.', severity: 'success' });
      }

      handleClose();
      await refreshUsers();
    } catch {
      setSnackbar({ message: 'Unable to save user.', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteUser(deleteId.toString());
      setSnackbar({ message: 'User deleted.', severity: 'success' });
      setDeleteId(null);
      await refreshUsers();
    } catch {
      setSnackbar({ message: 'Unable to delete user.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Box component="h2" sx={{ color: '#fff', fontSize: 18, mb: 0.5 }}>User Management</Box>
          <Box sx={{ color: 'rgba(255,255,255,0.7)' }}>Create, edit, and remove users from the system.</Box>
        </Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add User
        </Button>
      </Box>

      <Paper sx={{ height: 580, bgcolor: '#090A14', border: '1px solid rgba(255,255,255,0.08)' }}>
        {loading ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={users}
            columns={columns}
            getRowId={(row) => row.id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ border: 'none', color: '#fff', '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(255,255,255,0.08)' } }}
          />
        )}
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editRow ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                fullWidth
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Display Name"
                value={form.display_name}
                onChange={(event) => setForm({ ...form, display_name: event.target.value })}
                fullWidth
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Department"
                value={form.department}
                onChange={(event) => setForm({ ...form, department: event.target.value })}
                fullWidth
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Title"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                fullWidth
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Role"
                select
                value={form.role_id}
                onChange={(event) => setForm({ ...form, role_id: event.target.value })}
                fullWidth
                margin="dense"
              >
                {roles.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Azure OID"
                value={form.azure_oid}
                onChange={(event) => setForm({ ...form, azure_oid: event.target.value })}
                fullWidth
                margin="dense"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Active"
                value={form.is_active ? 'true' : 'false'}
                onChange={(event) => setForm({ ...form, is_active: event.target.value === 'true' })}
                fullWidth
                margin="dense"
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
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
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this user? This action cannot be undone.</DialogContent>
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

export default UsersTab;
