import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface AppCardProps {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  onClick?: () => void;
  background?: string;
}

function AppCard({ icon, title, subtitle, description, onClick, background }: AppCardProps) {
  const content = (
    <Card sx={{ bgcolor: '#12121F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: 0, textAlign: 'left', boxShadow: '0 4px 24px rgba(0,0,0,0.25)', position: 'relative', overflow: 'hidden', cursor: onClick ? 'pointer' : 'default', '&:hover': onClick ? { bgcolor: '#181830', transform: 'translateY(-2px)', transition: 'transform 0.2s ease' } : undefined }}>
      <Box sx={{ width: '100%', minHeight: 118, p: 3, display: 'flex', alignItems: 'flex-start', gap: 2, backgroundColor: '#0F0F1A' }}>
        <Box sx={{ width: 46, height: 46, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, backgroundColor: background ?? 'rgba(124,58,237,0.18)' }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 0.5, color: '#fff' }}>{title}</Typography>
          <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{subtitle}</Typography>
        </Box>
      </Box>
      <CardContent sx={{ pt: 2, pb: 2, px: 3 }}>
        <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', mb: 1.5, minHeight: 56 }}>{description}</Typography>
      </CardContent>
    </Card>
  );

  return onClick ? <CardActionArea onClick={onClick}>{content}</CardActionArea> : content;
}

export default AppCard;
