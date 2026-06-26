import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

interface SwagCardProps {
  emoji: string;
  name: string;
  description: string;
  points: number;
  disabled?: boolean;
}

function SwagCard({ emoji, name, description, points, disabled }: SwagCardProps) {
  return (
    <Card sx={{ bgcolor: '#12121F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.35)', '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s ease' } }}>
      <Box sx={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, backgroundColor: '#141422', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{emoji}</Box>
      <CardContent sx={{ p: 2 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 0.5 }}>{name}</Typography>
        <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', mb: 2 }}>{description}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#F59E0B' }}>⭐ {points}</Typography>
          <Button variant="contained" disabled={disabled} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', color: '#fff', px: 2, py: 0.8, fontSize: 12, fontWeight: 700, '&:disabled': { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' } }}>
            {disabled ? 'Need more pts' : 'Redeem'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default SwagCard;
