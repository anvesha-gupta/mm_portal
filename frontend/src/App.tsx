import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import PlaybenchPage from './pages/PlaybenchPage';
import AppsPage from './pages/AppsPage';
import SwagPage from './pages/SwagPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/admin/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes: wrap with ProtectedRoute and AppLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/playbench" element={<PlaybenchPage />} />
          <Route path="/apps" element={<AppsPage />} />
          <Route path="/swag" element={<SwagPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />

        </Route>
      </Route>
    </Routes>
  );
}

export default App;