import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import PageHeader from '../components/PageHeader';

const employees = [
  { name: 'Jane Smith', role: 'Employee', points: 750 },
  { name: 'David Chen', role: 'Engineering', points: 1200 },
  { name: 'Priya Nair', role: 'Finance', points: 340 },
  { name: 'Marcus Lee', role: 'HR Admin', points: 890 },
];

function AdminPage() {
  return (
    <Box sx={{ pt: 10, pl: 3, pr: 3, pb: 4, minHeight: '100vh' }}>
      <PageHeader title="HR Points Admin" subtitle="Restricted to HR/Management AD groups. Deposit recognition points to employee profiles." />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#12121F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.45)' }}>
            <CardContent>
              <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 3 }}>Deposit Recognition Points</Typography>
              <TextField select fullWidth label="Employee" value="Jane Smith" sx={{ mb: 2 }}>
                {employees.map((employee) => (
                  <MenuItem key={employee.name} value={employee.name}>{employee.name} ({employee.role})</MenuItem>
                ))}
              </TextField>
              <TextField fullWidth label="Points to Deposit" type="number" placeholder="e.g. 200" sx={{ mb: 2 }} />
              <TextField fullWidth label="Milestone / Reason" placeholder="e.g. Q2 Excellence Award" sx={{ mb: 3 }} />
              <Button variant="contained" fullWidth sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', textTransform: 'none' }}>
                Deposit Points → HR Alert
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#12121F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.45)' }}>
            <CardContent>
              <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 3 }}>Employee Ledger</Typography>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <Box component="thead">
                  <Box component="tr">
                    <Box component="th" sx={{ textAlign: 'left', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', pb: 1, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Employee</Box>
                    <Box component="th" sx={{ textAlign: 'left', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', pb: 1, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Role</Box>
                    <Box component="th" sx={{ textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', pb: 1, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Balance</Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {employees.map((employee) => (
                    <Box component="tr" key={employee.name}>
                      <Box component="td" sx={{ py: 1.25, color: 'rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{employee.name}</Box>
                      <Box component="td" sx={{ py: 1.25, color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{employee.role}</Box>
                      <Box component="td" sx={{ py: 1.25, textAlign: 'right', color: '#F59E0B', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{employee.points} pts</Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminPage;
