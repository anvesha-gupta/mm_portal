import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

function LoginPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#08080F', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', top: -200, left: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -150, right: -150, width: 500, height: 500, background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'relative', bgcolor: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, p: 5, width: 430, textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.15)' }}>
        <Stack alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 3, background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(124,58,237,0.5)' }}>
            <Typography sx={{ color: '#fff', fontSize: 22 }}>MM</Typography>
          </Box>
          <Box sx={{ textAlign: 'left' }}>
            <Typography sx={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Motive<span style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Minds</span></Typography>
            <Typography sx={{ fontSize: 10, color: '#C084FC', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Intelligence Simplified</Typography>
          </Box>
        </Stack>
        <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', mb: 4 }}>Employee Hub · Internal Portal</Typography>
        <Button disabled variant="contained" fullWidth sx={{ py: 1.75, gap: 1.5, borderRadius: 2, backgroundColor: '#fff', color: '#1a1a2e', fontWeight: 700, textTransform: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
          Sign in with Microsoft
        </Button>
        <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', mt: 2 }}>
          Azure AD integration is pending — sign-in will be enabled once corporate SSO is configured.
        </Typography>
        <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 700, mt: 3, mb: 1 }}>Demo: Select your AD role</Typography>
        <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={1}>
          {['Employee', 'Finance', 'HR Admin', 'Engineering'].map((role) => (
            <Button key={role} variant="outlined" sx={{ borderRadius: 99, px: 2, py: 0.8, minWidth: 0, color: 'rgba(255,255,255,0.75)', borderColor: 'rgba(255,255,255,0.15)', textTransform: 'none', fontWeight: 600, fontSize: 12 }}>
              {role}
            </Button>
          ))}
        </Stack>
        <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', mt: 3 }}>Azure AD · SAML 2.0 / OAuth 2.0 · SOC 2 Type II</Typography>
        <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', mt: 1, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
          Secure SSO · All access keys server-side only
        </Typography>
      </Box>
    </Box>
  );
}

export default LoginPage;
