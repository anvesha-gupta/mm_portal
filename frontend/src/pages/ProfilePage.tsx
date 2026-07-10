import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import PageHeader from '../components/PageHeader';
import useAuth from '../auth/useAuth';

const ROLE_LABELS: Record<string, string> = {
  employee: 'Employee',
  finance: 'Finance',
  hr: 'HR',
  admin: 'IT Admin',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function ProfilePage() {
  const { user } = useAuth();

  const initials = user ? getInitials(user.name) : '?';
  const roleLabel = user ? (ROLE_LABELS[user.role] ?? user.role) : '';

  return (
    <Box sx={{ pt: 10, pl: 3, pr: 3, pb: 4, minHeight: '100vh' }}>
      <PageHeader title="Profile" subtitle="Your employee profile and activity summary." />
      <Card sx={{ bgcolor: '#12121F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.45)' }}>
        <CardContent sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Avatar sx={{ width: 84, height: 84, bgcolor: '#7C3AED', fontSize: 28 }}>
            {initials}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 800, mb: 1 }}>
              {user?.name ?? '—'}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
              {roleLabel}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              {user?.email ?? ''}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ProfilePage;
