import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { RoutesPage } from './pages/RoutesPage';
import { SchoolsPage } from './pages/SchoolsPage';
import { OperationsPage } from './pages/OperationsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { User, UserRole } from './types';
import { SCHOOLS, MOCK_ROUTES, MOCK_TRIPS } from './services/mockData';
import useAppStore from './src/store/AppStore';

function AppContent() {
  const { auth, ui, setSelectedSchool, setUser, logout } = useAppStore();
  const currentUser = auth.user;
  const currentSchoolId = ui.selectedSchoolId;
  const navigate = useNavigate();
  const location = useLocation();

  const currentSchool = SCHOOLS.find(s => s.id === currentSchoolId) || null;

  useEffect(() => {
    if (currentUser?.role === UserRole.SCHOOL_ADMIN && currentUser.schoolId) {
      setSelectedSchool(currentUser.schoolId);
    } else if (currentUser?.role === UserRole.SUPER_ADMIN && !currentSchoolId) {
      setSelectedSchool('');
    }
  }, [currentUser, currentSchoolId, setSelectedSchool]);

  const handleLogin = (user: User) => {
    setUser(user);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    setSelectedSchool('');
    navigate('/');
  };

  const handleSchoolChange = (schoolId: string) => {
    setSelectedSchool(schoolId);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Filter data based on selected school
  const filteredRoutes = currentSchoolId 
    ? MOCK_ROUTES.filter(r => r.schoolId === currentSchoolId)
    : MOCK_ROUTES;

  const filteredTrips = currentSchoolId
     ? MOCK_TRIPS.filter(t => {
         const route = MOCK_ROUTES.find(r => r.id === t.routeId);
         return route?.schoolId === currentSchoolId;
     })
     : MOCK_TRIPS;

  // Derive activePage from URL path for Layout highlighting
  const activePage = location.pathname.split('/')[1] || 'dashboard';

  return (
    <Layout 
      currentUser={currentUser}
      currentSchool={currentSchool}
      onSchoolChange={handleSchoolChange}
      activePage={activePage}
      onNavigate={(page: string) => navigate(`/${page}`)}
      onLogout={handleLogout}
      notifications={ui.notifications || []}
    >
      <Routes>
        <Route path="/dashboard" element={<Dashboard routes={filteredRoutes} user={currentUser} onNavigate={(page: string) => navigate(`/${page}`)} />} />
        <Route path="/routes" element={<RoutesPage routes={filteredRoutes} schools={SCHOOLS} currentSchoolId={currentSchoolId || undefined} trips={filteredTrips} />} />
        <Route path="/operations" element={<OperationsPage currentUser={currentUser} />} />
        <Route path="/schools" element={<SchoolsPage currentUser={currentUser} />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;