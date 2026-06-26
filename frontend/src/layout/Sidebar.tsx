import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

const navItems = [
  { label: 'Launchpad', path: '/dashboard' },
  { label: 'AI Playbench', path: '/playbench', badge: 'New' },
  { label: 'Swag Store', path: '/swag', badge: '750' },
  { label: 'Apps', path: '/apps' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Profile', path: '/profile' },
  { label: 'Settings', path: '/settings' },
  { label: 'Admin', path: '/admin' },
];

function Sidebar() {
  return (
    <Box
      component="aside"
      sx={{
        width: 230,
        minHeight: '100vh',
        backgroundColor: '#0F0F1A',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        flexShrink: 0,
      }}
    >
      <Box sx={{ mb: 3, px: 1 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(124,58,237,0.5)',
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>MM</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.3px' }}>MotiveMinds</Typography>
            <Typography sx={{ fontSize: 10, fontWeight: 500, color: '#C084FC', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Hub
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)', px: 1, mb: 1 }}>
          Workspace
        </Typography>
        {navItems.slice(0, 3).map((item) => (
          <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
            {({ isActive }: { isActive: boolean }) => (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1,
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  color: isActive ? '#A855F7' : 'rgba(255,255,255,0.75)',
                  backgroundColor: isActive ? 'rgba(124,58,237,0.12)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                <Box sx={{ width: 18, height: 18, borderRadius: 0.5, backgroundColor: 'currentColor', opacity: 0.7 }} />
                <Typography>{item.label}</Typography>
                {item.badge ? (
                  <Box sx={{ ml: 'auto', px: 1, py: 0.3, borderRadius: 99, background: item.path === '/swag' ? 'rgba(245,158,11,0.15)' : 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', color: item.path === '/swag' ? '#000' : '#fff', fontSize: 10, fontWeight: 700 }}>
                    {item.badge}
                  </Box>
                ) : null}
              </Box>
            )}
          </NavLink>
        ))}

        <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)', px: 1, mt: 2, mb: 1 }}>
          Internal Tools
        </Typography>
        {navItems.slice(3, 6).map((item) => (
          <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
            {({ isActive }: { isActive: boolean }) => (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1,
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  color: isActive ? '#A855F7' : 'rgba(255,255,255,0.75)',
                  backgroundColor: isActive ? 'rgba(124,58,237,0.12)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                <Box sx={{ width: 18, height: 18, borderRadius: 0.5, backgroundColor: 'currentColor', opacity: 0.7 }} />
                <Typography>{item.label}</Typography>
              </Box>
            )}
          </NavLink>
        ))}

        <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)', px: 1, mt: 2, mb: 1 }}>
          Roadmap
        </Typography>
        <NavLink to="/future" style={{ textDecoration: 'none' }}>
          {({ isActive }: { isActive: boolean }) => (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1,
                px: 1.5,
                py: 1,
                borderRadius: 1,
                color: isActive ? '#A855F7' : 'rgba(255,255,255,0.42)',
                backgroundColor: isActive ? 'rgba(124,58,237,0.12)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              <Box sx={{ width: 18, height: 18, borderRadius: 0.5, backgroundColor: 'currentColor', opacity: 0.4 }} />
              <Typography>Future Systems</Typography>
            </Box>
          )}
        </NavLink>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      <Box sx={{ mt: 2, px: 1 }}>
        <Stack direction="row" alignItems="center" gap={1} sx={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 2, p: 1 }}>
          <Avatar sx={{ bgcolor: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', width: 34, height: 34, fontSize: 14, fontWeight: 700 }}>JS</Avatar>
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Jane Smith</Typography>
            <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Employee</Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

export default Sidebar;
