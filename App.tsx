import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { RoutesPage } from './pages/RoutesPage';
import { SchoolsPage } from './pages/SchoolsPage';
import { OperationsPage } from './pages/OperationsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ToastContainer } from './components/ToastContainer';
import { User, UserRole } from './types';
import { SCHOOLS } from './services/mockData';
import useAppStore from './src/store/AppStore';
import store from './src/store';
import { fetchSettings } from './src/store/slices/settingsSlice';

function AppContent() {
  const { auth, ui, entities, setSelectedSchool, setUser, logout } = useAppStore();
  const dispatch = useDispatch();
  const currentUser = auth.user;
  const currentSchoolId = ui.selectedSchoolId;
  const navigate = useNavigate();
  const location = useLocation();

  const currentSchool = SCHOOLS.find(s => s.id === currentSchoolId) || null;

  // SMART DATA-FLOW: Load settings from localStorage on app startup
  useEffect(() => {
    dispatch(fetchSettings() as any);
  }, [dispatch]);

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

  // SMART DATA-FLOW: All data filtering now handled by hooks in individual pages
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
      notifications={entities.notifications || []}
    >
      <ToastContainer />
      <Routes>
        <Route path="/dashboard" element={<Dashboard onNavigate={(page: string) => navigate(`/${page}`)} />} />
        <Route path="/routes" element={<RoutesPage />} />
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
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;