import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import PageHeader from '../components/PageHeader';

function ProfilePage() {
  return (
    <Box sx={{ pt: 10, pl: 3, pr: 3, pb: 4, minHeight: '100vh' }}>
      <PageHeader title="Profile" subtitle="Your employee profile and activity summary." />
      <Card sx={{ bgcolor: '#12121F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.45)' }}>
        <CardContent sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Avatar sx={{ width: 84, height: 84, bgcolor: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', fontSize: 28 }}>JS</Avatar>
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 800, mb: 1 }}>Jane Smith</Typography>
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>Employee</Typography>
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Department: Product</Typography>
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Location: Bangalore</Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ProfilePage;
