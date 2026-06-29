import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface DashboardAppCategory {
  category: string;
  applications: LaunchpadApp[];
}

function AppsPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<DashboardAppCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const loadApps = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<DashboardAppCategory[]>('/dashboard/apps', {
          signal: controller.signal,
        });
        setCategories(response.data);
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

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return categories;
    }

    return categories
      .map((category) => ({
        ...category,
        applications: category.applications.filter((app) => {
          return [app.display_name, app.description, app.category]
            .join(' ')
            .toLowerCase()
            .includes(normalizedQuery);
        }),
      }))
      .filter((category) => category.applications.length > 0);
  }, [categories, query]);

  const handleSearchClear = () => {
    setQuery('');
  };

  const handleCardClick = (app: LaunchpadApp) => {
    if (!app.launch_url) {
      return;
    }

    if (app.is_internal) {
      navigate(app.launch_url);
      return;
    }

    // TODO: Propagate Azure SSO token for external SaaS applications when SSO is implemented.
    window.open(app.launch_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box sx={{ pt: 5, pl: 3, pr: 3, pb: 4, minHeight: '100vh' }}>
      <PageHeader title="Applications" subtitle="All internal and external tools assigned to your role." />

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
      ) : filteredCategories.length === 0 ? (
        <Alert severity="info">No applications found. Change your search or contact your administrator.</Alert>
      ) : (
        filteredCategories.map((category) => (
          <Box key={category.category} sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 2, color: '#fff' }}>{category.category}</Typography>
            <Grid container spacing={2}>
              {category.applications.map((app) => (
                <Grid key={app.id} item xs={12} sm={6} md={4} lg={3}>
                  <AppCard
                    icon={app.icon || '⚙️'}
                    title={app.display_name}
                    subtitle={app.category}
                    description={app.description}
                    background="rgba(124,58,237,0.18)"
                    onClick={() => handleCardClick(app)}
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
