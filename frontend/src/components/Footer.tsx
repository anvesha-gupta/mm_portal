import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function Footer() {
  return (
    <Box component="footer" sx={{ py: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
      <Typography variant="body2" color="text.secondary">
        © Motiveminds Hub
      </Typography>
    </Box>
  );
}

export default Footer;
