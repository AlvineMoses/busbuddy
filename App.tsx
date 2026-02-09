import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { RoutesPage } from './pages/RoutesPage';
import { TripsPage } from './pages/TripsPage';
import { DriversPage } from './pages/DriversPage';
import { StudentsPage } from './pages/StudentsPage';
import { SchoolsPage } from './pages/SchoolsPage';
import { SettingsPage } from './pages/SettingsPage';
import { User, School, UserRole } from './types';
import { SCHOOLS, MOCK_ROUTES, MOCK_TRIPS, NOTIFICATIONS } from './services/mockData';
import { Construction } from 'lucide-react';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
    <Construction size={48} className="mb-4 text-slate-300" />
    <h2 className="text-2xl font-bold text-slate-600">{title}</h2>
    <p>This module is currently under development.</p>
  </div>
);

function App() {
  // State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSchoolId, setCurrentSchoolId] = useState<string>('');
  const [activePage, setActivePage] = useState('dashboard');
  
  // Computed
  const currentSchool = SCHOOLS.find(s => s.id === currentSchoolId) || null;

  // Effect: When user changes, reset school selection based on role logic
  useEffect(() => {
    if (currentUser?.role === UserRole.SCHOOL_ADMIN && currentUser.schoolId) {
      setCurrentSchoolId(currentUser.schoolId);
    } else {
      // Keep selected school if valid, or reset to '' for All Schools
      if (currentUser?.role === UserRole.SUPER_ADMIN && !currentSchoolId) {
         setCurrentSchoolId('');
      }
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentSchoolId('');
    setActivePage('dashboard');
  };

  const handleSchoolChange = (schoolId: string) => {
    setCurrentSchoolId(schoolId);
  };

  const renderContent = () => {
    if (!currentUser) return null;

    // Filter data based on selected school (if any)
    const filteredRoutes = currentSchoolId 
      ? MOCK_ROUTES.filter(r => r.schoolId === currentSchoolId)
      : MOCK_ROUTES;

    const filteredTrips = currentSchoolId
       ? MOCK_TRIPS.filter(t => {
           const route = MOCK_ROUTES.find(r => r.id === t.routeId);
           return route?.schoolId === currentSchoolId;
       })
       : MOCK_TRIPS;

    switch (activePage) {
      case 'dashboard':
        return <Dashboard routes={filteredRoutes} user={currentUser} onNavigate={setActivePage} />;
      case 'routes':
        return <RoutesPage routes={filteredRoutes} schools={SCHOOLS} currentSchoolId={currentSchoolId || undefined} trips={filteredTrips} />;
      case 'drivers':
        return <DriversPage currentUser={currentUser} />;
      case 'schools':
        return <SchoolsPage currentUser={currentUser} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard routes={filteredRoutes} user={currentUser} onNavigate={setActivePage} />;
    }
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      <Layout 
        currentUser={currentUser}
        currentSchool={currentSchool}
        onSchoolChange={handleSchoolChange}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout}
        notifications={NOTIFICATIONS}
      >
        {renderContent()}
      </Layout>
    </>
  );
}

export default App;