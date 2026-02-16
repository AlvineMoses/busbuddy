import React, { useState } from 'react';
import { useTheme } from '../src/hooks/useTheme';
import { ThemedButton } from '../src/components/ThemedComponents';
import { useRouteData, useDriverData } from '../src/hooks/useAppData';
import { useSelector } from 'react-redux';
import { 
 Bus, 
 Clock, 
 Navigation,
 ArrowUpRight,
 Building2,
 Users,
 Activity,
 FileText
} from 'lucide-react';
import { TransportRoute, User as UserType, UserRole, Driver } from '../types';
import { LiveRouteMap } from '../src/components/GoogleMaps';

interface DashboardProps {
 onNavigate: (page: string) => void;
}

// Sophisticated Widget Card
const WidgetCard = ({ label, value, subtext, icon: Icon, themeColor }: any) => {
 const { colors } = useTheme();
 
 const colorMap: any = {
 'lilac': { bg: colors.statusScheduled, text: colors.statusScheduled, light: `${colors.statusScheduled}1A` },
 'green': { bg: colors.statusActive, text: colors.statusActive, light: `${colors.statusActive}1A` },
 'amber': { bg: colors.statusWarning, text: colors.statusWarning, light: `${colors.statusWarning}1A` },
 'orange': { bg: colors.statusCompleted, text: colors.statusCompleted, light: `${colors.statusCompleted}1A` },
 };
 const theme = colorMap[themeColor] || colorMap['lilac'];
 
 return (
 <div className={`relative bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-soft-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden`}>
 {/* Background Decoration */}
 <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 opacity-60 group-hover:opacity-100 transition-opacity`} style={{ backgroundColor: theme.light }}></div>
 
 <div className="relative z-10 flex flex-col h-full justify-between gap-8">
 <div className="flex justify-between items-start">
 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm text-white`} style={{ backgroundColor: theme.bg }}>
 <Icon size={22} strokeWidth={2} />
 </div>
 <button className="w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors">
 <ArrowUpRight size={18} />
 </button>
 </div>
 
 <div>
 <h3 className="text-5xl font-medium text-brand-black tracking-tight mb-2">{value}</h3>
 <div className="flex items-center gap-2">
 <span className={`text-[11px] font-bold uppercase tracking-widest`} style={{ color: theme.text }}>{label}</span>
 <div className="h-1 w-1 rounded-full bg-gray-300"></div>
 <span className="text-xs text-gray-400 font-medium">{subtext}</span>
 </div>
 </div>
 </div>
 </div>
 );
};

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
 // SMART DATA-FLOW: Use centralized hooks
 const { routes } = useRouteData();
 const { drivers } = useDriverData();
 const user = useSelector((state: any) => state.app?.user);
 const { colors } = useTheme();
 const [feedTab, setFeedTab] = useState<'drivers' | 'fleet'>('fleet');
 const [driverSubTab, setDriverSubTab] = useState<'all' | 'online' | 'on-trip'>('all');

 const handleExport = () => {
 alert("Downloading Monthly Performance Analytics...");
 };

 const getMetrics = () => {
 const baseMetrics = {
 monthTrips: 1240,
 monthKm: 4500,
 activeTrips: routes.filter(r => r.status === 'ACTIVE').length,
 contracts: 12,
 schools: 3,
 students: 1240
 };

 if (user.role === UserRole.SUPER_ADMIN) {
 return [
 { label: 'Month Trips', value: baseMetrics.monthTrips.toLocaleString(), subtext: 'Total completed', icon: Bus, theme: 'lilac' },
 { label: 'Distance (Km)', value: baseMetrics.monthKm.toLocaleString(), subtext: 'Total covered', icon: Navigation, theme: 'green' },
 { label: 'Contracts', value: baseMetrics.contracts, subtext: 'Active agreements', icon: FileText, theme: 'amber' },
 { label: 'Schools', value: baseMetrics.schools, subtext: 'Institutions', icon: Building2, theme: 'orange' }
 ];
 } else if (user.role === UserRole.ADMIN) {
 return [
 { label: 'Month Trips', value: baseMetrics.monthTrips.toLocaleString(), subtext: 'Total completed', icon: Bus, theme: 'lilac' },
 { label: 'Distance (Km)', value: baseMetrics.monthKm.toLocaleString(), subtext: 'Total covered', icon: Navigation, theme: 'green' },
 { label: 'Active Trips', value: baseMetrics.activeTrips, subtext: 'Currently live', icon: Clock, theme: 'amber' },
 { label: 'Schools', value: baseMetrics.schools, subtext: 'Managed', icon: Building2, theme: 'orange' }
 ];
 } else {
 return [
 { label: 'Month Trips', value: baseMetrics.monthTrips.toLocaleString(), subtext: 'Total completed', icon: Bus, theme: 'lilac' },
 { label: 'Distance (Km)', value: baseMetrics.monthKm.toLocaleString(), subtext: 'Total covered', icon: Navigation, theme: 'green' },
 { label: 'Active Trips', value: baseMetrics.activeTrips, subtext: 'Currently live', icon: Clock, theme: 'amber' },
 { label: 'Students', value: baseMetrics.students.toLocaleString(), subtext: 'Enrolled', icon: Users, theme: 'orange' }
 ];
 }
 };

 const metrics = getMetrics();
 
 // Filter drivers by status for live feed
 const filteredDrivers = (drivers as Driver[]).filter((d: Driver) => {
 if (driverSubTab === 'all') return true;
 if (driverSubTab === 'online') return d.status === 'AVAILABLE';
 if (driverSubTab === 'on-trip') return d.status === 'ON_TRIP';
 return true;
 });

 return (
 <div className="space-y-8 animate-in fade-in duration-700">
 
 {/* Title Section */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
 <div>
 <h1 className="text-6xl font-medium text-brand-black tracking-tight mb-2">Overview</h1>
 <p className="text-gray-500 font-normal text-xl">Platform metrics & live status.</p>
 </div>
 <ThemedButton variant="primary" onClick={handleExport} icon={ArrowUpRight}>
 Export Analytics
 </ThemedButton>
 </div>

 {/* Metrics Widgets */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {metrics.map((m, i) => (
 <WidgetCard 
 key={i}
 label={m.label} 
 value={m.value} 
 subtext={m.subtext} 
 icon={m.icon} 
 themeColor={m.theme}
 />
 ))}
 </div>

 {/* Map & Feed Section */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[750px]">
 
 {/* Live Feed Panel */}
 <div className="bg-white/60 backdrop-blur-md rounded-[3rem] shadow-soft-xl border border-white/60 flex flex-col overflow-hidden">
 <div className="p-8 pb-4">
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-2xl font-medium text-brand-black">Live Feed</h3>
 <div className="p-2 bg-white rounded-full shadow-sm"><Activity size={20} className="text-" /></div>
 </div>

 {/* Tab Toggle */}
 <div className="flex p-1.5 bg-gray-100/50 rounded-2xl mb-6">
 <button onClick={() => setFeedTab('fleet')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${feedTab === 'fleet' ? 'shadow-sm text-white' : 'text-gray-400 hover:text-gray-600'}`} style={feedTab === "fleet" ? { backgroundColor: colors.primary } : {}}>Fleet Status</button>
 <button onClick={() => setFeedTab('drivers')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${feedTab === 'drivers' ? 'shadow-sm text-white' : 'text-gray-400 hover:text-gray-600'}`} style={feedTab === "drivers" ? { backgroundColor: colors.primary } : {}}>Drivers</button>
 </div>
 
 {/* Subtabs for Drivers */}
 {feedTab === 'drivers' && (
 <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
 {['all', 'online', 'on-trip'].map(sub => (
 <button key={sub} onClick={() => setDriverSubTab(sub as any)} className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all whitespace-nowrap ${driverSubTab === sub ? 'bg-brand-black text-white border-brand-black' : 'bg-white text-gray-500 border-gray-200'}`}>
 {sub.replace('-', ' ')}
 </button>
 ))}
 </div>
 )}
 </div>
 
 <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
 {feedTab === 'fleet' ? (
 routes.map(route => (
 <div key={route.id} className="p-4 rounded-[2rem] bg-white border border-gray-50 hover:shadow-lg transition-all flex items-center justify-between group cursor-pointer">
 <div className="flex items-center gap-4">
 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${route.health === 'NORMAL' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
 <Bus size={20} />
 </div>
 <div>
 <p className="font-bold text-brand-black">{route.vehiclePlate}</p>
 <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{route.name}</p>
 </div>
 </div>
 <div className={`w-3 h-3 rounded-full ${route.health === 'NORMAL' ? 'bg-green-500' : 'bg-amber-500'} shadow-sm`}></div>
 </div>
 ))
 ) : (
 filteredDrivers.map(driver => (
 <div key={driver.id} className="p-4 rounded-[2rem] bg-white border border-gray-50 hover:shadow-lg transition-all flex items-center justify-between group cursor-pointer">
 <div className="flex items-center gap-4">
 <img src={driver.avatar} className="w-12 h-12 rounded-2xl object-cover" />
 <div>
 <p className="font-bold text-brand-black">{driver.name}</p>
 <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{driver.vehicle}</p>
 </div>
 </div>
 <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${driver.status === 'AVAILABLE' ? 'bg-green-50 text-green-600 border-green-100' : driver.status === 'ON_TRIP' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
 {driver.status.replace('_', ' ')}
 </span>
 </div>
 ))
 )}
 </div>
 </div>

 {/* Map Widget */}
 <div className="lg:col-span-2 h-full">
 <LiveRouteMap routes={routes} onNavigate={onNavigate} />
 </div>
 </div>
 </div>
 );
};