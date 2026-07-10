import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import PageHeader from '../components/PageHeader';

interface SystemCard {
  id: string;
  title: string;
  description: string;
  quarter: string;
  icon: string;
  color: string;
}

const systems: SystemCard[] = [
  {
    id: 'expense',
    title: 'Expense Management',
    description: 'Automated expense filing, approval workflows, and reimbursement tracking integrated with SAP.',
    quarter: 'Q1 2025',
    icon: '💰',
    color: '#7C3AED',
  },
  {
    id: 'knowledge',
    title: 'Knowledge Management',
    description: 'Centralized knowledge base and AI-powered intelligent document search across all teams.',
    quarter: 'Q4 2025',
    icon: '📚',
    color: '#A855F7',
  },
  {
    id: 'idea',
    title: 'Idea Tracking Matrix',
    description: 'Employee innovation submissions, categorization, and lifecycle tracking from idea to execution.',
    quarter: 'Q1 2026',
    icon: '💡',
    color: '#7C3AED',
  },
  {
    id: 'reserved',
    title: 'Reserved Slot',
    description: 'This canvas block is guaranteed for a future internal initiative. Stay tuned.',
    quarter: 'TBE',
    icon: '⚙️',
    color: '#6366F1',
  },
];

function FutureSystemsPage() {
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
        title="Future Systems"
        subtitle="Jumpstart your analytics—an must-need for upcoming internal platforms."
      />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {systems.map((system) => (
          <Grid item xs={12} sm={6} key={system.id}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                bgcolor: '#12121F',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: system.color,
                  boxShadow: `0 0 20px ${system.color}20`,
                  transform: 'translateY(-4px)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: system.color,
                  opacity: 0.6,
                },
              }}
            >
              {/* Quarter Badge */}
              <Chip
                label={system.quarter}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  bgcolor: system.quarter === 'TBE' 
                    ? 'rgba(255,255,255,0.1)' 
                    : `${system.color}22`,
                  color: system.quarter === 'TBE' 
                    ? 'rgba(255,255,255,0.7)' 
                    : system.color,
                  fontSize: '10px',
                  fontWeight: 600,
                  border: `1px solid ${system.color}44`,
                }}
              />

              {/* Icon */}
              <Typography
                sx={{
                  fontSize: 48,
                  mb: 2,
                  display: 'inline-block',
                }}
              >
                {system.icon}
              </Typography>

              {/* Title */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 1.5,
                  fontSize: 18,
                  color: '#fff',
                }}
              >
                {system.title}
              </Typography>

              {/* Description */}
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.65)',
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {system.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default FutureSystemsPage;
