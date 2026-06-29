import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import api from '../services/api';

interface LaunchpadApp {
  id: string;
  display_name: string;
  description: string;
  category: string;
  launch_url: string | null;
  icon: string;
  is_internal: boolean;
  display_order: number;
}

function AppsPage() {
  const [apps, setApps] = useState<LaunchpadApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const loadApps = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<LaunchpadApp[]>('/apps', { signal: controller.signal });
        setApps(response.data);
      } catch (err) {
        if ((err as any).name !== 'CanceledError') {
          setError('Unable to load applications. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadApps();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<LaunchpadApp[]>('/apps/search', {
          params: { q: query },
          signal: controller.signal,
        });
        setApps(response.data);
      } catch (err) {
        if ((err as any).name !== 'CanceledError') {
          setError('Search failed. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const groupedApps = useMemo(() => {
    return apps.reduce<Record<string, LaunchpadApp[]>>((groups, app) => {
      const category = app.category || 'Other';
      groups[category] = groups[category] || [];
      groups[category].push(app);
      return groups;
    }, {});
  }, [apps]);

  const handleSearchClear = () => {
    setQuery('');
  };

  const handleCardClick = (launchUrl: string | null) => {
    if (!launchUrl) return;
    window.open(launchUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box sx={{ pt: 5, pl: 3, pr: 3, pb: 4, minHeight: '100vh' }}>
      <PageHeader title="Applications" subtitle="All internal and SaaS tools assigned to your role." />

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center', mb: 3 }}>
        <TextField
          fullWidth
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search applications by name, description, or category"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" onClick={handleSearchClear} disabled={!query}>
                  ×
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : apps.length === 0 ? (
        <Alert severity="info">No applications found. Try changing the search terms or contact your administrator.</Alert>
      ) : (
        Object.entries(groupedApps).map(([category, categoryApps]) => (
          <Box key={category} sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 2, color: '#fff' }}>{category}</Typography>
            <Grid container spacing={2}>
              {categoryApps.map((app) => (
                <Grid key={app.id} item xs={12} sm={6} md={4} lg={3}>
                  <AppCard
                    icon={app.icon || '⚙️'}
                    title={app.display_name}
                    subtitle={app.category}
                    description={app.description}
                    background="rgba(124,58,237,0.18)"
                    onClick={() => handleCardClick(app.launch_url)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}
    </Box>
  );
}

export default AppsPage;
