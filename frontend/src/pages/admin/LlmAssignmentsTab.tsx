import { useEffect, useMemo, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
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
import Stack from '@mui/material/Stack';
import {
  getEmployeeAssignments,
  createEmployeeAssignment,
  updateEmployeeAssignment,
  deleteEmployeeAssignment,
  resetEmployeeQuotas,
  getUsers,
  getLlmModels,
  EmployeeAssignmentRow,
  UserRow,
  LlmModelRow,
} from '../../services/adminApi';

const defaultForm = {
  employee_id: '',
  llm_id: '',
  assigned_tokens: 100000,
  used_tokens: 0,
  remaining_tokens: 100000,
  active: true,
};

function LlmAssignmentsTab() {
  const [assignments, setAssignments] = useState<EmployeeAssignmentRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [models, setModels] = useState<LlmModelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState<EmployeeAssignmentRow | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const [deleteRowRef, setDeleteRowRef] = useState<EmployeeAssignmentRow | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<'all' | 'single'>('all');
  const [singleResetRef, setSingleResetRef] = useState<EmployeeAssignmentRow | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, usersData, modelsData] = await Promise.all([
        getEmployeeAssignments(),
        getUsers(),
        getLlmModels(),
      ]);
      setAssignments(assignmentsData);
      setUsers(usersData.filter((u) => u.is_active));
      setModels(modelsData.filter((m) => m.is_active));
    } catch {
      setSnackbar({ message: 'Unable to load assignments data.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const refreshAssignments = async () => {
    try {
      setLoading(true);
      const data = await getEmployeeAssignments();
      setAssignments(data);
    } catch {
      setSnackbar({ message: 'Unable to refresh assignments.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: 'employee_name', headerName: 'Employee', flex: 1, minWidth: 150 },
      { field: 'employee_email', headerName: 'Email', flex: 1.2, minWidth: 180 },
      { field: 'llm_name', headerName: 'Assigned LLM', flex: 1, minWidth: 140 },
      { field: 'assigned_tokens', headerName: 'Quota (Tokens)', flex: 0.8, minWidth: 120, type: 'number' },
      { field: 'used_tokens', headerName: 'Used', flex: 0.8, minWidth: 100, type: 'number' },
      { field: 'remaining_tokens', headerName: 'Remaining', flex: 0.8, minWidth: 120, type: 'number' },
      { field: 'active', headerName: 'Active', width: 90, type: 'boolean' },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 250,
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
              color="warning"
              size="small"
              onClick={() => handleTriggerSingleReset(params.row)}
              sx={{ borderColor: 'rgba(255,255,255,0.16)' }}
            >
              Reset
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => setDeleteRowRef(params.row)}
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

  const handleEdit = (row: EmployeeAssignmentRow) => {
    setEditRow(row);
    setForm({
      employee_id: row.employee_id,
      llm_id: row.llm_id,
      assigned_tokens: row.assigned_tokens,
      used_tokens: row.used_tokens,
      remaining_tokens: row.remaining_tokens,
      active: row.active,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setEditRow(null);
    setForm(defaultForm);
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!form.employee_id || !form.llm_id) {
      setSnackbar({ message: 'Employee and LLM model are required.', severity: 'error' });
      return;
    }

    try {
      const payload: Partial<EmployeeAssignmentRow> = {
        employee_id: form.employee_id,
        llm_id: form.llm_id,
        assigned_tokens: Number(form.assigned_tokens),
        used_tokens: Number(form.used_tokens),
        remaining_tokens: Number(form.remaining_tokens),
        active: form.active,
      };

      if (editRow) {
        await updateEmployeeAssignment(editRow.employee_id, editRow.llm_id, payload);
        setSnackbar({ message: 'Assignment updated successfully.', severity: 'success' });
      } else {
        await createEmployeeAssignment(payload);
        setSnackbar({ message: 'Assignment created successfully.', severity: 'success' });
      }

      handleClose();
      await refreshAssignments();
    } catch (err: any) {
      console.error(err);
      setSnackbar({ message: err.response?.data?.detail || 'Unable to save assignment.', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteRowRef) return;

    try {
      await deleteEmployeeAssignment(deleteRowRef.employee_id, deleteRowRef.llm_id);
      setSnackbar({ message: 'Assignment deleted.', severity: 'success' });
      setDeleteRowRef(null);
      await refreshAssignments();
    } catch {
      setSnackbar({ message: 'Unable to delete assignment.', severity: 'error' });
    }
  };

  const handleTriggerSingleReset = (row: EmployeeAssignmentRow) => {
    setSingleResetRef(row);
    setResetTarget('single');
    setResetModalOpen(true);
  };

  const handleTriggerGlobalReset = () => {
    setResetTarget('all');
    setResetModalOpen(true);
  };

  const handleResetConfirm = async () => {
    try {
      if (resetTarget === 'single' && singleResetRef) {
        await resetEmployeeQuotas(singleResetRef.employee_id, singleResetRef.llm_id);
        setSnackbar({ message: `Reset quota for ${singleResetRef.employee_name}.`, severity: 'success' });
      } else {
        await resetEmployeeQuotas();
        setSnackbar({ message: 'Reset quotas for all employees.', severity: 'success' });
      }
      setResetModalOpen(false);
      setSingleResetRef(null);
      await refreshAssignments();
    } catch {
      setSnackbar({ message: 'Unable to reset quota(s).', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Box component="h2" sx={{ color: '#fff', fontSize: 18, mb: 0.5 }}>Employee Assignments & Quotas</Box>
          <Box sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Assign LLM models to employees and manage their token quotas.</Box>
        </Box>
        <Stack direction="row" gap={1.5}>
          <Button variant="outlined" color="warning" onClick={handleTriggerGlobalReset}>
            Reset All Quotas
          </Button>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Assign Model
          </Button>
        </Stack>
      </Box>

      <Paper sx={{ height: 500, bgcolor: '#090A14', border: '1px solid rgba(255,255,255,0.08)' }}>
        {loading ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={assignments}
            columns={columns}
            getRowId={(row) => `${row.employee_id}-${row.llm_id}`}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ border: 'none', color: '#fff', '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(255,255,255,0.08)' } }}
          />
        )}
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editRow ? 'Edit Assignment' : 'Assign LLM Model'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Employee"
                select
                value={form.employee_id}
                onChange={(event) => setForm({ ...form, employee_id: event.target.value })}
                disabled={Boolean(editRow)}
                fullWidth
                margin="dense"
              >
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.display_name} ({u.email})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="LLM Model"
                select
                value={form.llm_id}
                onChange={(event) => setForm({ ...form, llm_id: event.target.value })}
                disabled={Boolean(editRow)}
                fullWidth
                margin="dense"
              >
                {models.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.display_name} ({m.provider.toUpperCase()})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Assigned Tokens"
                type="number"
                value={form.assigned_tokens}
                onChange={(event) => setForm({ ...form, assigned_tokens: Number(event.target.value) })}
                fullWidth
                margin="dense"
              />
            </Grid>
            {editRow && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Used Tokens"
                    type="number"
                    value={form.used_tokens}
                    onChange={(event) => setForm({ ...form, used_tokens: Number(event.target.value) })}
                    fullWidth
                    margin="dense"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Remaining Tokens"
                    type="number"
                    value={form.remaining_tokens}
                    onChange={(event) => setForm({ ...form, remaining_tokens: Number(event.target.value) })}
                    fullWidth
                    margin="dense"
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Assignment Active"
                value={form.active ? 'true' : 'false'}
                onChange={(event) => setForm({ ...form, active: event.target.value === 'true' })}
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

      <Dialog open={Boolean(deleteRowRef)} onClose={() => setDeleteRowRef(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this LLM assignment? The employee will no longer have access to this model on Playbench.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteRowRef(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resetModalOpen} onClose={() => setResetModalOpen(false)}>
        <DialogTitle>Confirm Quota Reset</DialogTitle>
        <DialogContent>
          {resetTarget === 'single'
            ? `Are you sure you want to reset the quota for ${singleResetRef?.employee_name} on model ${singleResetRef?.llm_name}? Remaining tokens will be restored to their initial limit.`
            : 'Are you sure you want to reset quotas for ALL employees? All used tokens will be set to 0 and remaining tokens restored to their full assignment.'}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetModalOpen(false)}>Cancel</Button>
          <Button color="warning" variant="contained" onClick={handleResetConfirm}>
            Reset Quota
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

export default LlmAssignmentsTab;
