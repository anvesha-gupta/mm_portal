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

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          {/* ===================================================== */}
          {/* ALL LOGGED IN USERS */}
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

          <Route
            path="/leaderboard"
            element={<LeaderboardPage />}
          />

          {/* ===================================================== */}
          {/* EMPLOYEE + HR + FINANCE + ADMIN */}
          {/* ===================================================== */}

          <Route
            path="/wyngs"
            element={
              <RoleGuard
                roles={[
                  "employee",
                  "finance",
                  "hr",
                  "admin",
                ]}
              >
                <WyngsPage />
              </RoleGuard>
            }
          />

          <Route
            path="/playbench"
            element={
              <RoleGuard
                roles={[
                  "employee",
                  "finance",
                  "hr",
                  "admin",
                ]}
              >
                <PlaybenchPage />
              </RoleGuard>
            }
          />

          {/* ===================================================== */}
          {/* EMPLOYEE ONLY APPS */}
          {/* ===================================================== */}

          <Route
            path="/mindscript"
            element={
              <RoleGuard
                roles={[
                  "employee",
                  "admin",
                ]}
              >
                <MindscriptPage />
              </RoleGuard>
            }
          />

          <Route
            path="/resolve-iq"
            element={
              <RoleGuard
                roles={[
                  "employee",
                  "admin",
                ]}
              >
                <ResolveIQPage />
              </RoleGuard>
            }
          />

          <Route
            path="/myra"
            element={
              <RoleGuard
                roles={[
                  "employee",
                  "admin",
                ]}
              >
                <MyRAPage />
              </RoleGuard>
            }
          />

          {/* ===================================================== */}
          {/* FINANCE */}
          {/* ===================================================== */}

          <Route
            path="/expense-management"
            element={
              <RoleGuard
                roles={[
                  "finance",
                  "admin",
                ]}
              >
                <ExpenseManagementPage />
              </RoleGuard>
            }
          />

          <Route
            path="/estimatrix"
            element={
              <RoleGuard
                roles={[
                  "finance",
                  "admin",
                ]}
              >
                <EstimatrixPage />
              </RoleGuard>
            }
          />

          {/* ===================================================== */}
          {/* HR */}
          {/* ===================================================== */}

          <Route
            path="/knowledge-management"
            element={
              <RoleGuard
                roles={[
                  "hr",
                ]}
              >
                <KnowledgeManagementPage />
              </RoleGuard>
            }
          />

          <Route
            path="/idea-tracking"
            element={
              <RoleGuard
                roles={[
                  "hr",
                ]}
              >
                <IdeaTrackingPage />
              </RoleGuard>
            }
          />

          {/* ===================================================== */}
          {/* ADMIN */}
          {/* ===================================================== */}

          <Route
            path="/admin"
            element={
              <RoleGuard
                roles={[
                  "admin",
                ]}
              >
                <AdminPage />
              </RoleGuard>
            }
          />

          <Route
            path="*"
            element={<NotFoundPage />}
          />

        </Route>
      </Route>
    </Routes>
  );
}

export default App;