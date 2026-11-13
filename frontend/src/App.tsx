import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { LoadingScreen } from './components/LoadingScreen';
import { NavigationProgressBar } from './components/layout/NavigationProgressBar';

// Public pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { VerifyPage } from './pages/verification/VerifyPage';

// Student pages
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { DocumentCataloguePage } from './pages/student/DocumentCataloguePage';
import { AllDocumentsPage } from './pages/student/AllDocumentsPage';
import { ApplicationsPage } from './pages/student/ApplicationsPage';
import { ApplicationFormPage } from './pages/student/ApplicationFormPage';
import { TrackStatusPage } from './pages/student/TrackStatusPage';
import { DownloadsPage } from './pages/student/DownloadsPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { NotificationsPage } from './pages/student/NotificationsPage';
import { HelpPage } from './pages/student/HelpPage';

// Admin portals (Strictly segregated roles - Zero overlap)
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { ClerkQueuePage } from './pages/admin/ClerkQueuePage';
import { HodQueuePage } from './pages/admin/HodQueuePage';
import { PrincipalQueuePage } from './pages/admin/PrincipalQueuePage';
import { AdminSetupPage } from './pages/admin/AdminSetupPage';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 300);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready) return <LoadingScreen />;

  return (
    <>
      <NavigationProgressBar />
      <Routes>
        {/* ── PUBLIC ROUTES ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/verify/:token" element={<VerifyPage />} />

        {/* ── ADMIN AUTH ── */}
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* ── INDEPENDENT ADMIN PORTALS (NO ROLE OVERLAP) ── */}
        <Route path="/admin/clerk" element={<ClerkQueuePage />} />
        <Route path="/admin/hod" element={<HodQueuePage />} />
        <Route path="/admin/principal" element={<PrincipalQueuePage />} />
        <Route path="/admin/setup" element={<AdminSetupPage />} />

        {/* ── STUDENT PORTAL (AppShell) ── */}
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<StudentDashboardPage />} />
          <Route path="/documents" element={<DocumentCataloguePage />} />
          <Route path="/documents/all" element={<AllDocumentsPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/applications/new" element={<ApplicationFormPage />} />
          <Route path="/apply" element={<ApplicationFormPage />} />
          <Route path="/apply/:type" element={<ApplicationFormPage />} />
          <Route path="/documents/:type/apply" element={<ApplicationFormPage />} />
          <Route path="/applications/:id" element={<ApplicationsPage />} />
          <Route path="/track-status" element={<TrackStatusPage />} />
          <Route path="/downloads" element={<DownloadsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Route>

        {/* ── FALLBACK ── */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
