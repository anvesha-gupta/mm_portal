import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface AppCardProps {
  id?: string;
  icon: string;
  title: string;
  type: string;
  external?: boolean;
  background: string;
  link?: string;
  url?: string;
}

function AppCard({
  id,
  icon,
  title,
  type,
  external,
  background,
  link,
  url,
}: AppCardProps) {
  const navigate = useNavigate();

  const handleClick = async () => {
    if (id) {
      try {
        const { data } = await api.post(`/api/apps/${id}/launch`);
        if (data.launch_type === 'sso' && data.redirect_url) {
          window.location.href = data.redirect_url;
          return;
        } else if (data.launch_type === 'external' && data.url) {
          window.location.href = data.url;
          return;
        } else if (data.launch_type === 'internal' && data.route) {
          navigate(data.route);
          return;
        }
      } catch (error) {
        console.error("Error launching app via SSO, falling back to static URL config", error);
      }
    }

    // Fallback if no id or if the backend request fails
    if (external && url) {
      window.location.href = url;
    } else if (link) {
      navigate(link);
    }
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        bgcolor: '#12121F',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 2,
        p: 2.5,
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          bgcolor: '#181830',
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        },
      }}
    >
      {external ? (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            fontSize: 10,
            fontWeight: 700,
            px: 1,
            py: 0.3,
            borderRadius: 99,
            backgroundColor: 'rgba(56,189,248,0.12)',
            color: '#38BDF8',
            border: '1px solid rgba(56,189,248,0.2)',
          }}
        >
          ↗ SaaS
        </Box>
      ) : null}

      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: 2,
          mx: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          mb: 1.5,
          backgroundColor: background,
        }}
      >
        {icon}
      </Box>

      <CardContent>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 700,
            mb: 0.5,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          {type}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default AppCard;
