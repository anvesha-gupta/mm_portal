import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router-dom';

function NotFoundPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', px: 3 }}>
      <Box>
        <Typography sx={{ fontSize: 32, fontWeight: 800, mb: 2 }}>Page Not Found</Typography>
        <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', mb: 3 }}>
          The requested page does not exist. Please check the URL or return to your dashboard.
        </Typography>
        <Button component={RouterLink} to="/dashboard" variant="contained" sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', textTransform: 'none' }}>
          Go to Dashboard
        </Button>
      </Box>
    </Box>
  );
}

export default NotFoundPage;
