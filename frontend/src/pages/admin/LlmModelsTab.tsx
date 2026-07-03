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
  getLlmModels,
  createLlmModel,
  updateLlmModel,
  deleteLlmModel,
  LlmModelRow,
} from '../../services/adminApi';

const defaultForm = {
  id: '',
  provider: '',
  display_name: '',
  description: '',
  context_window_tokens: 128000,
  is_active: true,
  sort_order: 0,
  endpoint_url: '',
  model_name: '',
  monthly_limit: 50000,
};

const providers = ['openai', 'anthropic', 'meta', 'google', 'cohere', 'other'];

function LlmModelsTab() {
  const [models, setModels] = useState<LlmModelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState<LlmModelRow | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const [deleteId, setDeleteId] = useState<GridRowId | null>(null);

  useEffect(() => {
    loadModelsList();
  }, []);

  const loadModelsList = async () => {
    try {
      setLoading(true);
      const data = await getLlmModels();
      setModels(data);
    } catch {
      setSnackbar({ message: 'Unable to load LLM models.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: 'id', headerName: 'Model ID', flex: 0.8, minWidth: 120 },
      { field: 'display_name', headerName: 'Display Name', flex: 1, minWidth: 150 },
      { field: 'provider', headerName: 'Provider', flex: 0.7, minWidth: 100 },
      { field: 'model_name', headerName: 'Actual Model Name', flex: 1, minWidth: 160 },
      { field: 'monthly_limit', headerName: 'Monthly Limit (Tokens)', flex: 0.8, minWidth: 130, type: 'number' },
      { field: 'is_active', headerName: 'Active', width: 90, type: 'boolean' },
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
              onClick={() => handleEdit(params.row)}
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

  const handleEdit = (row: LlmModelRow) => {
    setEditRow(row);
    setForm({
      id: row.id,
      provider: row.provider,
      display_name: row.display_name,
      description: row.description ?? '',
      context_window_tokens: row.context_window_tokens ?? 128000,
      is_active: row.is_active,
      sort_order: row.sort_order ?? 0,
      endpoint_url: row.endpoint_url ?? '',
      model_name: row.model_name ?? '',
      monthly_limit: row.monthly_limit ?? 50000,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setEditRow(null);
    setForm(defaultForm);
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!form.id || !form.display_name || !form.provider) {
      setSnackbar({ message: 'Model ID, Provider, and Display Name are required.', severity: 'error' });
      return;
    }

    try {
      const payload: Partial<LlmModelRow> = {
        id: form.id.trim(),
        provider: form.provider.trim(),
        display_name: form.display_name.trim(),
        description: form.description.trim() || null,
        context_window_tokens: Number(form.context_window_tokens) || null,
        is_active: form.is_active,
        sort_order: Number(form.sort_order) || 0,
        endpoint_url: form.endpoint_url.trim() || null,
        model_name: form.model_name.trim() || null,
        monthly_limit: Number(form.monthly_limit) || null,
      };

      if (editRow) {
        await updateLlmModel(editRow.id, payload);
        setSnackbar({ message: 'LLM Model updated successfully.', severity: 'success' });
      } else {
        await createLlmModel(payload);
        setSnackbar({ message: 'LLM Model created successfully.', severity: 'success' });
      }

      handleClose();
      await loadModelsList();
    } catch (err: any) {
      console.error(err);
      setSnackbar({ message: err.response?.data?.detail || 'Unable to save LLM Model.', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteLlmModel(deleteId.toString());
      setSnackbar({ message: 'LLM Model deleted.', severity: 'success' });
      setDeleteId(null);
      await loadModelsList();
    } catch {
      setSnackbar({ message: 'Unable to delete LLM Model.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Box component="h2" sx={{ color: '#fff', fontSize: 18, mb: 0.5 }}>LLM Master Configuration</Box>
          <Box sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Configure base LLM models, API endpoints, actual names, and global token limits.</Box>
        </Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add LLM Model
        </Button>
      </Box>

      <Paper sx={{ height: 500, bgcolor: '#090A14', border: '1px solid rgba(255,255,255,0.08)' }}>
        {loading ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={models}
            columns={columns}
            getRowId={(row) => row.id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ border: 'none', color: '#fff', '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(255,255,255,0.08)' } }}
          />
        )}
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editRow ? 'Edit LLM Model' : 'Add LLM Model'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Model ID / Key"
                value={form.id}
                onChange={(event) => setForm({ ...form, id: event.target.value })}
                disabled={Boolean(editRow)}
                fullWidth
                margin="dense"
                placeholder="e.g. gpt-4o"
                helperText="Must match internal key (e.g. gpt-4o)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Display Name"
                value={form.display_name}
                onChange={(event) => setForm({ ...form, display_name: event.target.value })}
                fullWidth
                margin="dense"
                placeholder="e.g. GPT-4o"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Provider"
                select
                value={form.provider}
                onChange={(event) => setForm({ ...form, provider: event.target.value })}
                fullWidth
                margin="dense"
              >
                {providers.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option.toUpperCase()}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Actual Model Name"
                value={form.model_name}
                onChange={(event) => setForm({ ...form, model_name: event.target.value })}
                fullWidth
                margin="dense"
                placeholder="e.g. gpt-4o-2024-05-13"
                helperText="Exact model identifier for API calls"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Endpoint URL"
                value={form.endpoint_url}
                onChange={(event) => setForm({ ...form, endpoint_url: event.target.value })}
                fullWidth
                margin="dense"
                placeholder="e.g. https://api.openai.com/v1/chat/completions"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Monthly Limit (Tokens)"
                type="number"
                value={form.monthly_limit}
                onChange={(event) => setForm({ ...form, monthly_limit: Number(event.target.value) })}
                fullWidth
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Context Window (Tokens)"
                type="number"
                value={form.context_window_tokens}
                onChange={(event) => setForm({ ...form, context_window_tokens: Number(event.target.value) })}
                fullWidth
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Sort Order"
                type="number"
                value={form.sort_order}
                onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })}
                fullWidth
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Status"
                value={form.is_active ? 'true' : 'false'}
                onChange={(event) => setForm({ ...form, is_active: event.target.value === 'true' })}
                fullWidth
                margin="dense"
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                fullWidth
                margin="dense"
                multiline
                rows={2}
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
        <DialogContent>Are you sure you want to delete this LLM model? Doing so will remove all associated user configurations and assignments.</DialogContent>
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

export default LlmModelsTab;
