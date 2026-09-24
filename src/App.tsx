import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppLayout } from './components/layout/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { RealityCheckPage } from './pages/RealityCheckPage';
import { NavigatorPage } from './pages/NavigatorPage';
import { ComparePage } from './pages/ComparePage';
import { RoadmapPage } from './pages/RoadmapPage';
import { TasksPage } from './pages/TasksPage';
import { MentorPage } from './pages/MentorPage';
import { PracticePage } from './pages/PracticePage';
import { ChallengesPage } from './pages/ChallengesPage';
import { CommunityPage } from './pages/CommunityPage';
import { MentorsPage } from './pages/MentorsPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { BusinessBuilderPage } from './pages/BusinessBuilderPage';
import { SkillPassportPage } from './pages/SkillPassportPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">
        Loading Career Solver session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Routes>
            {/* Public Landing & Auth */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Authenticated Application Shell */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/reality-check" element={<RealityCheckPage />} />
              <Route path="/navigator" element={<NavigatorPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/mentor" element={<MentorPage />} />
              <Route path="/practice" element={<PracticePage />} />
              <Route path="/challenges" element={<ChallengesPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/mentors" element={<MentorsPage />} />
              <Route path="/organizations" element={<OrganizationsPage />} />
              <Route path="/business" element={<BusinessBuilderPage />} />
              <Route path="/skill-passport" element={<SkillPassportPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
