import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PlaybenchPage from "./pages/PlaybenchPage";
import AppsPage from "./pages/AppsPage";
import HomePage from "./pages/HomePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import SwagPage from "./pages/SwagPage";
import AdminPage from "./pages/AdminPage";
import NotFoundPage from "./pages/NotFoundPage";

import MindscriptPage from "./pages/MindscriptPage";
import ResolveIQPage from "./pages/ResolveIQPage";
import WyngsPage from "./pages/WyngsPage";
import EstimatrixPage from "./pages/EstimatrixPage";
import MyRAPage from "./pages/MyRAPage";

import ExpenseManagementPage from "./pages/ExpenseManagementPage";
import KnowledgeManagementPage from "./pages/KnowledgeManagementPage";
import IdeaTrackingPage from "./pages/IdeaTrackingPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/playbench" element={<PlaybenchPage />} />
          <Route path="/apps" element={<AppsPage />} />

          {/* Feature 5.1 */}
          <Route path="/mindscript" element={<MindscriptPage />} />
          <Route path="/resolve-iq" element={<ResolveIQPage />} />

          {/* New internal systems */}
          <Route path="/wyngs" element={<WyngsPage />} />
          <Route path="/estimatrix" element={<EstimatrixPage />} />
          <Route path="/myra" element={<MyRAPage />} />

          {/* Feature 5.2 */}
          <Route
            path="/expense-management"
            element={<ExpenseManagementPage />}
          />
          <Route
            path="/knowledge-management"
            element={<KnowledgeManagementPage />}
          />
          <Route
            path="/idea-tracking"
            element={<IdeaTrackingPage />}
          />

          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/swag" element={<SwagPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/home" element={<HomePage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;