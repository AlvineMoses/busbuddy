import React, { useEffect, useState } from 'react';
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
import { User, UserRole, School } from './types';
import { schoolService } from './src/services/UnifiedApiService';
import store from './src/store';
import { fetchSettings } from './src/store/slices/settingsSlice';
import { setUser as setUserAction, logoutUser } from './src/store/slices/authSlice';
import { setSelectedSchool } from './src/store/slices/uiSlice';
import { useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './src/store';

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentSchoolId = useSelector((state: RootState) => state.ui.selectedSchoolId);
  const notifications = useSelector((state: RootState) => state.entities.notifications);
  const navigate = useNavigate();
  const location = useLocation();
  const [schools, setSchools] = useState<School[]>([]);

  const currentSchool = schools.find(s => s.id === currentSchoolId) || null;

  // Load schools when user is authenticated
  useEffect(() => {
    if (currentUser) {
      schoolService.getAll().then(result => {
        setSchools(result.schools);
      }).catch(error => {
        console.error('Failed to load schools:', error);
      });
    }
  }, [currentUser]);

  // SMART DATA-FLOW: Load settings from localStorage on app startup
  useEffect(() => {
    dispatch(fetchSettings() as any);
  }, [dispatch]);

  useEffect(() => {
    if (currentUser?.role === UserRole.SCHOOL_ADMIN && currentUser.schoolId) {
      dispatch(setSelectedSchool(currentUser.schoolId));
    } else if (currentUser?.role === UserRole.SUPER_ADMIN && !currentSchoolId) {
      dispatch(setSelectedSchool(''));
    }
  }, [currentUser, currentSchoolId, dispatch]);

  const handleLogin = (user: User) => {
    dispatch(setUserAction(user));
    navigate('/dashboard');
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(setSelectedSchool(''));
    navigate('/');
  };

  const handleSchoolChange = (schoolId: string) => {
    dispatch(setSelectedSchool(schoolId));
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
      schools={schools}
      onSchoolChange={handleSchoolChange}
      activePage={activePage}
      onNavigate={(page: string) => navigate(`/${page}`)}
      onLogout={handleLogout}
      notifications={notifications || []}
    >
      <ToastContainer />
      <Routes>
        <Route path="/dashboard" element={<Dashboard onNavigate={(page: string) => navigate(`/${page}`)} />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/operations" element={<OperationsPage />} />
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