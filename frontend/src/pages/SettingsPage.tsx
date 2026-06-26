import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import PageHeader from '../components/PageHeader';

function SettingsPage() {
  return (
    <Box sx={{ pt: 10, pl: 3, pr: 3, pb: 4, minHeight: '100vh' }}>
      <PageHeader title="Settings" subtitle="Personalize your MotiveMinds Hub experience." />
      <Card sx={{ bgcolor: '#12121F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.45)' }}>
        <CardContent>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField fullWidth label="Full Name" defaultValue="Jane Smith" InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }} sx={{ input: { color: '#fff' }, fieldset: { borderColor: 'rgba(255,255,255,0.15)' } }} />
            <TextField fullWidth label="Email Address" defaultValue="jane.smith@motiveminds.com" InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }} sx={{ input: { color: '#fff' }, fieldset: { borderColor: 'rgba(255,255,255,0.15)' } }} />
            <TextField fullWidth label="Department" defaultValue="Product" InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }} sx={{ input: { color: '#fff' }, fieldset: { borderColor: 'rgba(255,255,255,0.15)' } }} />
            <Button variant="contained" sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', textTransform: 'none' }}>
              Save Settings
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default SettingsPage;
