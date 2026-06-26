import Box from '@mui/material/Box';
import Sidebar from './Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';

function AppLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#08080F', color: '#fff' }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Box component="main" sx={{ flex: 1, pt: 3, px: 3, pb: 4 }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}

export default AppLayout;
