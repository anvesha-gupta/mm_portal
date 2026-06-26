import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

interface StatCardProps {
  label: string;
  value: string;
  delta: string;
  color?: string;
}

function StatCard({ label, value, delta, color }: StatCardProps) {
  const valueStyles = color?.includes('linear-gradient')
    ? { background: color, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
    : { color };

  return (
    <Card sx={{ bgcolor: '#12121F', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
      <CardContent>
        <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)', mb: 1 }}>{label}</Typography>
        <Typography sx={{ fontSize: 28, fontWeight: 900, letterSpacing: '-1.5px', ...valueStyles }}>{value}</Typography>
        <Typography sx={{ fontSize: 11, mt: 0.5, color: 'rgba(255,255,255,0.65)' }}>{delta}</Typography>
      </CardContent>
    </Card>
  );
}

export default StatCard;
