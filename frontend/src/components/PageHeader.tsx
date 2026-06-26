import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.4px' }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>{subtitle}</Typography>
    </Box>
  );
}

export default PageHeader;
