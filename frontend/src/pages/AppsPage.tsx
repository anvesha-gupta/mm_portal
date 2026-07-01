import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';

const appItems = [
  {
    icon: '🛫',
    title: 'Wyngs',
    type: 'Internal',
    external: false,
    bg: 'rgba(124,58,237,0.18)',
  },
  {
    icon: '📊',
    title: 'Estimatrix',
    type: 'Internal',
    external: false,
    bg: 'rgba(16,185,129,0.18)',
  },
  {
    icon: '🤖',
    title: 'MyRA',
    type: 'Internal',
    external: false,
    bg: 'rgba(168,85,247,0.18)',
  },

  // ===== Feature 5.1 =====
  {
    icon: '🧠',
    title: 'Mindscript',
    type: 'AI Tool',
    external: false,
    bg: 'rgba(99,102,241,0.18)',
    link: '/mindscript',
  },
  {
    icon: '🧩',
    title: 'Resolve IQ',
    type: 'AI Tool',
    external: false,
    bg: 'rgba(14,165,233,0.18)',
    link: '/resolveiq',
  },

  // ===== Feature 5.2 =====
  {
    icon: '💰',
    title: 'Expense Management',
    type: 'Future Module',
    external: false,
    bg: 'rgba(34,197,94,0.18)',
    link: '/expense-management',
  },
  {
    icon: '📚',
    title: 'Knowledge Management',
    type: 'Future Module',
    external: false,
    bg: 'rgba(168,85,247,0.18)',
    link: '/knowledge-management',
  },
  {
    icon: '💡',
    title: 'Idea Tracking',
    type: 'Future Module',
    external: false,
    bg: 'rgba(250,204,21,0.18)',
    link: '/idea-tracking',
  },
  // =======================

  {
    icon: '🏢',
    title: 'Keka',
    type: 'SaaS',
    external: true,
    bg: 'rgba(56,189,248,0.15)',
  },
  {
    icon: '☁️',
    title: 'Salesforce',
    type: 'SaaS',
    external: true,
    bg: 'rgba(56,189,248,0.15)',
  },
  {
    icon: '📒',
    title: 'Zoho Books',
    type: 'SaaS',
    external: true,
    bg: 'rgba(16,185,129,0.18)',
  },
  {
    icon: '🛡️',
    title: 'Admin Panel',
    type: 'Internal',
    external: false,
    bg: 'rgba(239,68,68,0.15)',
  },
  {
    icon: '🦊',
    title: 'GitLab',
    type: 'SaaS',
    external: true,
    bg: 'rgba(245,158,11,0.18)',
  },
];

function AppsPage() {
  return (
    <Box
      sx={{
        pt: 10,
        pl: 3,
        pr: 3,
        pb: 4,
        minHeight: '100vh',
      }}
    >
      <PageHeader
        title="Applications"
        subtitle="All internal and SaaS tools assigned to your role."
      />

      <Grid container spacing={2}>
        {appItems.map((app) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={app.title}>
            <AppCard
              icon={app.icon}
              title={app.title}
              type={app.type}
              external={app.external}
              background={app.bg}
              link={app.link}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default AppsPage;