import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';

function Header() {
  return (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: 0,
        left: 230,
        right: 0,
        height: 64,
        backgroundColor: 'rgba(8,8,15,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        px: 3,
        gap: 2,
        zIndex: 100,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Launchpad <Typography component="span" sx={{ ml: 1, fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.62)', fontStyle: 'italic' }}>Intelligence Simplified</Typography></Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.8, borderRadius: 99, backgroundColor: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B', fontWeight: 700, fontSize: 12 }}>
          ⭐ 750 pts
        </Box>
        <IconButton size="small" sx={{ width: 36, height: 36, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.75)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff' } }}>
          <NotificationsNoneOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Header;
