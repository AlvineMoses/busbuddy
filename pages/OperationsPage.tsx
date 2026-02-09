import React, { useState } from 'react';
import { useTheme } from '../src/hooks/useTheme';
import { Truck } from 'lucide-react';
import { User } from '../types';
import { DriversPage } from './DriversPage';
import { ShiftsPage } from './ShiftsPage';
import { AssignmentsPage } from './AssignmentsPage';

interface OperationsPageProps {
 currentUser: User;
}

export const OperationsPage: React.FC<OperationsPageProps> = ({ currentUser }) => {
 const [activeTab, setActiveTab] = useState<'drivers' | 'shifts' | 'assignments'>('drivers');
 const { colors } = useTheme();

 return (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
 
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
 <div>
 <h1 className="text-5xl font-medium text-brand-black tracking-tight mb-2">Operations</h1>
 <p className="text-gray-500 font-normal text-xl mb-6">Fleet personnel, schedules & route assignments.</p>
 
 <div className="inline-flex p-1.5 bg-white rounded-full border border-gray-100 shadow-sm">
 <button
 onClick={() => setActiveTab('drivers')}
 className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
 activeTab === 'drivers'
 ? 'text-white shadow-lg'
 : 'text-gray-400 hover:text-brand-black'
 }`}
 style={activeTab === 'drivers' ? { backgroundColor: colors.primary } : undefined}
 >
 Drivers
 </button>
 <button
 onClick={() => setActiveTab('shifts')}
 className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
 activeTab === 'shifts'
 ? 'text-white shadow-lg'
 : 'text-gray-400 hover:text-brand-black'
 }`}
 style={activeTab === 'shifts' ? { backgroundColor: colors.primary } : undefined}
 >
 Shifts
 </button>
 <button
 onClick={() => setActiveTab('assignments')}
 className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
 activeTab === 'assignments'
 ? 'text-white shadow-lg'
 : 'text-gray-400 hover:text-brand-black'
 }`}
 style={activeTab === 'assignments' ? { backgroundColor: colors.primary } : undefined}
 >
 Assignments
 </button>
 </div>
 </div>
 </div>

 {activeTab === 'drivers' && <DriversPage currentUser={currentUser} showHeader={false} />}
 {activeTab === 'shifts' && <ShiftsPage currentUser={currentUser} showHeader={false} />}
 {activeTab === 'assignments' && <AssignmentsPage currentUser={currentUser} showHeader={false} />}
 </div>
 );
};
