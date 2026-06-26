import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

function PlaybenchPage() {
  return (
    <Box sx={{ pt: 10, pl: 3, pr: 3, pb: 4, minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.4px' }}>
          AI <Box component="span" sx={{ fontStyle: 'italic', background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Playbench</Box>
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>Corporate AI gateway — all keys are managed server-side, nothing exposed to your browser.</Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 270px', gap: 2, height: 'calc(100vh - 120px)' }}>
        <Card sx={{ bgcolor: '#12121F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel sx={{ color: '#A855F7' }}>Model</InputLabel>
              <Select defaultValue="gpt4o" label="Model" sx={{ color: '#fff', backgroundColor: '#141422', borderRadius: 1, border: '1px solid rgba(255,255,255,0.08)' }}>
                <MenuItem value="gpt4o">GPT-4o</MenuItem>
                <MenuItem value="claude">Claude 3.5 Sonnet</MenuItem>
                <MenuItem value="llama">Llama 3 (70B)</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ px: 1.5, py: 0.7, borderRadius: 99, backgroundColor: 'rgba(124,58,237,0.12)', color: '#A855F7', fontSize: 11, fontWeight: 700 }}>OpenAI</Box>
            <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', ml: 'auto' }}>🔒 Key brokered server-side</Typography>
          </Box>
          <CardContent sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, p: 2.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignSelf: 'flex-start', maxWidth: '80%' }}>
              <Box sx={{ bgcolor: '#141422', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: 2 }}>
                <Typography sx={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
                  👋 Welcome to <strong>The Playbench</strong>! I'm your corporate AI assistant, connected through the MotiveMinds LLM Gateway.
                  <br /><br />Your API credentials are managed securely on our backend — your browser never sees a key. How can I help you today?
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Assistant · just now</Typography>
            </Box>
          </CardContent>
          <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <TextField
              multiline
              minRows={2}
              placeholder="Message the AI…"
              fullWidth
              sx={{
                flex: 1,
                backgroundColor: '#141422',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.08)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.18)',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '14px',
                },
              }}
            />
            <Button variant="contained" sx={{ minWidth: 42, minHeight: 42, borderRadius: 2, background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', boxShadow: '0 0 12px rgba(124,58,237,0.4)', textTransform: 'none' }}>
              ➤
            </Button>
          </Box>
        </Card>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          <Card sx={{ bgcolor: '#12121F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, p: 2 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)', mb: 1 }}>Daily Token Usage</Typography>
            <Box sx={{ backgroundColor: '#141422', borderRadius: 99, height: 7, overflow: 'hidden', mb: 1 }}>
              <Box sx={{ width: '32%', height: '100%', background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' }} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
              <span>3,200 used</span>
              <span>10,000 limit</span>
            </Box>
            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', mt: 1 }}>Resets at midnight UTC</Typography>
          </Card>
          <Card sx={{ bgcolor: '#12121F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, p: 2 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)', mb: 1 }}>Available Models</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['GPT-4o', 'Claude 3.5 Sonnet', 'Llama 3 70B'].map((model, index) => (
                <Box key={model} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: index === 2 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: index === 2 ? 'rgba(255,255,255,0.15)' : '#10B981' }} />
                  {model}
                  <Box sx={{ ml: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{index === 0 ? 'All tiers' : index === 1 ? 'T2+' : 'Engineering'}</Box>
                </Box>
              ))}
            </Box>
          </Card>
          <Card sx={{ bgcolor: '#12121F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, p: 2 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)', mb: 1 }}>Security Posture</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
              <span>✅ API keys never sent to browser</span>
              <span>✅ All requests via MM backend proxy</span>
              <span>✅ Usage logs retained for compliance</span>
              <span>✅ Per-user daily token enforcement</span>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

export default PlaybenchPage;
