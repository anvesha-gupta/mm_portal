import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import PageHeader from '../components/PageHeader';

const leaderboardData = [
  { name: 'Jane Smith', role: 'Employee', points: 750 },
  { name: 'David Chen', role: 'Engineering', points: 1200 },
  { name: 'Priya Nair', role: 'Finance', points: 340 },
  { name: 'Marcus Lee', role: 'HR Admin', points: 890 },
];

function LeaderboardPage() {
  return (
    <Box sx={{ pt: 10, pl: 3, pr: 3, pb: 4, minHeight: '100vh' }}>
      <PageHeader title="Leaderboard" subtitle="Team recognition rankings based on points earned." />
      <TableContainer component={Paper} sx={{ backgroundColor: '#12121F', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Employee</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Role</TableCell>
              <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboardData.map((row) => (
              <TableRow key={row.name}>
                <TableCell sx={{ color: 'rgba(255,255,255,0.85)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{row.name}</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.75)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{row.role}</TableCell>
                <TableCell align="right" sx={{ color: '#F59E0B', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{row.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default LeaderboardPage;
