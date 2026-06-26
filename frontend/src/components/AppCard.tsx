import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface AppCardProps {
  icon: string;
  title: string;
  type: string;
  external?: boolean;
  background: string;
}

function AppCard({ icon, title, type, external, background }: AppCardProps) {
  return (
    <Card sx={{ bgcolor: '#12121F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: 2.5, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.25)', position: 'relative', overflow: 'hidden', cursor: 'pointer', '&:hover': { bgcolor: '#181830', transform: 'translateY(-2px)', transition: 'transform 0.2s ease' } }}>
      {external ? (
        <Box sx={{ position: 'absolute', top: 12, right: 12, fontSize: 10, fontWeight: 700, px: 1, py: 0.3, borderRadius: 99, backgroundColor: 'rgba(56,189,248,0.12)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.2)' }}>↗ SaaS</Box>
      ) : null}
      <Box sx={{ width: 50, height: 50, borderRadius: 2, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, mb: 1.5, backgroundColor: background }}>
        {icon}
      </Box>
      <CardContent>
        <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 0.5 }}>{title}</Typography>
        <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{type}</Typography>
      </CardContent>
    </Card>
  );
}

export default AppCard;
