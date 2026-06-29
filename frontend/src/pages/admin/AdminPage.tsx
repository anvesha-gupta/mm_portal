import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PageHeader from '../../components/PageHeader';
import UsersTab from './UsersTab';
import RolesTab from './RolesTab';
import AppsTab from './AppsTab';
import OverridesTab from './OverridesTab';

const tabConfig = [
  { label: 'Users', value: 'users' },
  { label: 'Roles', value: 'roles' },
  { label: 'Applications', value: 'apps' },
  { label: 'Overrides', value: 'overrides' },
];

function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'apps' | 'overrides'>('users');

  const currentTab = useMemo(() => {
    switch (activeTab) {
      case 'roles':
        return <RolesTab />;
      case 'apps':
        return <AppsTab />;
      case 'overrides':
        return <OverridesTab />;
      default:
        return <UsersTab />;
    }
  }, [activeTab]);

  return (
    <Box sx={{ pt: 5, pl: 3, pr: 3, pb: 4, minHeight: '100vh' }}>
      <PageHeader title="Admin Console" subtitle="Manage users, roles, applications, and access overrides." />
      <Paper sx={{ p: 1, bgcolor: '#0E0E1A', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ '& .MuiTabs-flexContainer': { gap: 1 }, mb: 2 }}
        >
          {tabConfig.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              value={tab.value}
              sx={{ textTransform: 'none', color: '#fff', fontWeight: 600 }}
            />
          ))}
        </Tabs>
        {currentTab}
      </Paper>
    </Box>
  );
}

export default AdminPage;
