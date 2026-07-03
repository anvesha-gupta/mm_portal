import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import PageHeader from '../components/PageHeader';

function MyRAPage() {
  return (
    <Box
      sx={{
        pt: 10,
        pl: 3,
        pr: 3,
        pb: 4,
        minHeight: '100vh',
      }}
    >
      <PageHeader
        title="MyRA"
        subtitle="Internal automation and AI assistant"
      />

      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 5,
          textAlign: 'center',
          bgcolor: '#12121F',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 3,
        }}
      >
        <Typography variant="h2" sx={{ mb: 2 }}>
          🤖
        </Typography>

        <Typography variant="h5" fontWeight={700}>
          MyRA
        </Typography>

        <Typography
          sx={{
            mt: 2,
            color: 'rgba(255,255,255,0.65)',
          }}
        >
          This module is a visual placeholder for the internal MyRA automation platform.
        </Typography>
      </Paper>
    </Box>
  );
}

export default MyRAPage;
