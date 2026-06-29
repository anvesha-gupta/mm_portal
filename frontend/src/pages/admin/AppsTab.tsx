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
  createApp,
  deleteApp,
  getApps,
  updateApp,
  AppRow,
} from '../../services/adminApi';

const defaultForm = {
  id: '',
  name: '',
  description: '',
  long_description: '',
  category_tag: '',
  icon_name: '',
  gradient_class: '',
  icon_bg_class: '',
  launch_url: '',
  sort_order: 0,
  is_active: true,
};

function AppsTab() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState<AppRow | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const [deleteId, setDeleteId] = useState<GridRowId | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getApps();
        setApps(data);
      } catch {
        setSnackbar({ message: 'Unable to load applications.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: 'id', headerName: 'App ID', flex: 0.9, minWidth: 140 },
      { field: 'name', headerName: 'Name', flex: 1.2, minWidth: 160 },
      { field: 'category_tag', headerName: 'Category', flex: 0.9, minWidth: 130 },
      { field: 'icon_name', headerName: 'Icon', flex: 0.8, minWidth: 120 },
      { field: 'sort_order', headerName: 'Sort', width: 100, type: 'number' },
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

  const refreshApps = async () => {
    try {
      setLoading(true);
      const data = await getApps();
      setApps(data);
    } catch {
      setSnackbar({ message: 'Unable to refresh apps.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    const row = apps.find((item) => item.id === id);
    if (!row) return;
    setEditRow(row);
    setForm({
      id: row.id,
      name: row.name,
      description: row.description,
      long_description: row.long_description ?? '',
      category_tag: row.category_tag,
      icon_name: row.icon_name,
      gradient_class: row.gradient_class ?? '',
      icon_bg_class: row.icon_bg_class ?? '',
      launch_url: row.launch_url ?? '',
      sort_order: row.sort_order,
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
        id: form.id,
        name: form.name,
        description: form.description,
        long_description: form.long_description || undefined,
        category_tag: form.category_tag,
        icon_name: form.icon_name,
        gradient_class: form.gradient_class || undefined,
        icon_bg_class: form.icon_bg_class || undefined,
        launch_url: form.launch_url || undefined,
        sort_order: form.sort_order,
        is_active: form.is_active,
      };

      if (editRow) {
        await updateApp(editRow.id, payload);
        setSnackbar({ message: 'Application updated successfully.', severity: 'success' });
      } else {
        await createApp(payload);
        setSnackbar({ message: 'Application created successfully.', severity: 'success' });
      }

      handleClose();
      await refreshApps();
    } catch {
      setSnackbar({ message: 'Unable to save application.', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteApp(deleteId.toString());
      setSnackbar({ message: 'Application deleted.', severity: 'success' });
      setDeleteId(null);
      await refreshApps();
    } catch {
      setSnackbar({ message: 'Unable to delete application.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Box component="h2" sx={{ color: '#fff', fontSize: 18, mb: 0.5 }}>Application Management</Box>
          <Box sx={{ color: 'rgba(255,255,255,0.7)' }}>Manage apps, endpoints, and portal access configuration.</Box>
        </Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Application
        </Button>
      </Box>

      <Paper sx={{ height: 580, bgcolor: '#090A14', border: '1px solid rgba(255,255,255,0.08)' }}>
        {loading ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={apps}
            columns={columns}
            getRowId={(row) => row.id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ border: 'none', color: '#fff', '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(255,255,255,0.08)' } }}
          />
        )}
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editRow ? 'Edit Application' : 'Add Application'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="App ID"
                value={form.id}
                onChange={(event) => setForm({ ...form, id: event.target.value })}
                fullWidth
                disabled={Boolean(editRow)}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                fullWidth
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Category"
                value={form.category_tag}
                onChange={(event) => setForm({ ...form, category_tag: event.target.value })}
                fullWidth
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Icon Name"
                value={form.icon_name}
                onChange={(event) => setForm({ ...form, icon_name: event.target.value })}
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
                rows={2}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Long Description"
                value={form.long_description}
                onChange={(event) => setForm({ ...form, long_description: event.target.value })}
                fullWidth
                multiline
                rows={3}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Launch URL"
                value={form.launch_url}
                onChange={(event) => setForm({ ...form, launch_url: event.target.value })}
                fullWidth
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Sort Order"
                type="number"
                value={form.sort_order}
                onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })}
                fullWidth
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                label="Gradient Class"
                value={form.gradient_class}
                onChange={(event) => setForm({ ...form, gradient_class: event.target.value })}
                fullWidth
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Icon BG Class"
                value={form.icon_bg_class}
                onChange={(event) => setForm({ ...form, icon_bg_class: event.target.value })}
                fullWidth
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
        <DialogContent>Remove this application and revoke any associated overrides.</DialogContent>
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

export default AppsTab;
