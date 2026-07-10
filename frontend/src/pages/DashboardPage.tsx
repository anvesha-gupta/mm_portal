import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import AppCard from '../components/AppCard';
import { appItems } from './AppsPage';
import api from '../services/api';
import { usePoints } from '../context/PointsContext';
import useAuth from '../auth/useAuth';

function DashboardPage() {
  const { hasPermission, user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const { balance, orders } = usePoints();
  const [tokenSummary, setTokenSummary] = useState({ assigned: 0, used: 0, remaining: 0 });
  const [loadingTokens, setLoadingTokens] = useState(true);

  const visibleApps = appItems.filter((app) => hasPermission(app.id));

  useEffect(() => {
    async function loadStats() {
      try {
        const { data } = await api.get('/playbench/token-summary');
        setTokenSummary(data);
      } catch (error) {
        console.error("Error loading token summary", error);
      } finally {
        setLoadingTokens(false);
      }
    }
    loadStats();
  }, []);

  const stats = [
    { label: 'Points Balance', value: balance.toString(), delta: '↑ 200 pts this month', color: '#F59E0B' },
    {
      label: 'AI Tokens Remaining',
      value: loadingTokens ? '...' : tokenSummary.remaining.toLocaleString(),
      delta: loadingTokens ? '⚡ loading...' : `⚡ ${tokenSummary.used.toLocaleString()} used of ${tokenSummary.assigned.toLocaleString()}`,
      color: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)'
    },
    { label: 'Apps Available', value: visibleApps.length.toString(), delta: 'based on your AD role', color: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' },
    {
      label: 'Orders Pending',
      value: orders.length.toString(),
      delta: orders.length > 0 ? `${orders[orders.length - 1].emoji} ${orders[orders.length - 1].name} · in fulfillment` : 'No pending orders',
      color: '#FFFFFF',
    },
  ];

  return (
    <Box sx={{ pt: 10, pl: 3, pr: 3, pb: 4, minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.4px' }}>
          {greeting}, <Box component="span" sx={{ fontStyle: 'italic', background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{firstName}</Box>
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>Your personalised hub — apps, AI tools, and rewards in one place.</Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card sx={{ bgcolor: '#12121F', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
              <CardContent>
                <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)', mb: 1 }}>{stat.label}</Typography>
                <Typography sx={{ fontSize: 28, fontWeight: 900, letterSpacing: '-1.5px', background: stat.color.includes('gradient') ? stat.color : undefined, WebkitBackgroundClip: stat.color.includes('gradient') ? 'text' : undefined, WebkitTextFillColor: stat.color.includes('gradient') ? 'transparent' : undefined, color: stat.color.includes('gradient') ? undefined : stat.color }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ fontSize: 11, mt: 0.5, color: stat.label === 'Orders Pending' ? 'rgba(255,255,255,0.45)' : stat.color === '#F59E0B' ? '#10B981' : 'rgba(255,255,255,0.7)' }}>{stat.delta}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box>
        <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)', mb: 1 }}>Your Applications</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(162px, 1fr))', gap: 1.5 }}>
          {visibleApps.map((app) => (
            <AppCard
              key={app.title}
              id={app.id}
              icon={app.icon}
              title={app.title}
              type={app.type}
              external={app.external}
              background={app.bg}
              link={app.link}
              url={app.url}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardPage;
