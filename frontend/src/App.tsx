import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./auth/ProtectedRoute";
import RoleGuard from "./auth/RoleGuard";

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
import FutureSystemsPage from "./pages/FutureSystemsPage";

function App() {
  return (
    <Routes>

      {/* ===================================================== */}
      {/* LOGIN */}
      {/* ===================================================== */}

      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          {/* ===================================================== */}
          {/* AVAILABLE TO EVERY LOGGED-IN USER */}
          {/* ===================================================== */}

          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/apps"
            element={<AppsPage />}
          />

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

          <Route
            path="/settings"
            element={<SettingsPage />}
          />

          <Route
            path="/home"
            element={<HomePage />}
          />

          <Route
            path="/swag"
            element={<SwagPage />}
          />

          {/* ===================================================== */}
          {/* PERMISSION PROTECTED ROUTES */}
          {/* ===================================================== */}

          <Route
            path="/leaderboard"
            element={
              <RoleGuard appId="leaderboard">
                <LeaderboardPage />
              </RoleGuard>
            }
          />

          <Route
            path="/playbench"
            element={
              <RoleGuard appId="playbench">
                <PlaybenchPage />
              </RoleGuard>
            }
          />

          <Route
            path="/wyngs"
            element={
              <RoleGuard appId="wyngs">
                <WyngsPage />
              </RoleGuard>
            }
          />

          <Route
            path="/mindscript"
            element={
              <RoleGuard appId="mindscript">
                <MindscriptPage />
              </RoleGuard>
            }
          />

          <Route
            path="/resolve-iq"
            element={
              <RoleGuard appId="resolve-iq">
                <ResolveIQPage />
              </RoleGuard>
            }
          />

          <Route
            path="/myra"
            element={
              <RoleGuard appId="myra">
                <MyRAPage />
              </RoleGuard>
            }
          />

          <Route
            path="/expense-management"
            element={
              <RoleGuard appId="expense-management">
                <ExpenseManagementPage />
              </RoleGuard>
            }
          />

          <Route
            path="/estimatrix"
            element={
              <RoleGuard appId="estimatrix">
                <EstimatrixPage />
              </RoleGuard>
            }
          />

          <Route
            path="/knowledge-management"
            element={
              <RoleGuard appId="knowledge-management">
                <KnowledgeManagementPage />
              </RoleGuard>
            }
          />

          <Route
            path="/idea-tracking"
            element={
              <RoleGuard appId="idea-tracking">
                <IdeaTrackingPage />
              </RoleGuard>
            }
          />

<<<<<<< HEAD
          <Route path="/future" element={<FutureSystemsPage />} />
          <Route path="/future-systems" element={<FutureSystemsPage />} />

          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/swag" element={<SwagPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/home" element={<HomePage />} />
=======
          <Route
            path="/admin"
            element={
              <RoleGuard appId="admin">
                <AdminPage />
              </RoleGuard>
            }
          />

          {/* ===================================================== */}
          {/* 404 */}
          {/* ===================================================== */}

          <Route
            path="*"
            element={<NotFoundPage />}
          />
>>>>>>> 19f7015d0c9e76e953864cc2312ecf5d7cfe72b6

        </Route>
      </Route>

    </Routes>
  );
}

export default App;