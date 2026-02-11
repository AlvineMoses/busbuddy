import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../src/hooks/useTheme';
import { ThemedButton } from '../src/components/ThemedComponents';
import { TransportRoute, RouteHealth, School, Trip } from '../types';
import { 
 Search, 
 Plus, 
 Download, 
 MoreHorizontal, 
 MapPin, 
 Edit2,
 List,
 List as ListIcon,
 Map,
 Filter,
 Route as RouteIcon,
 Trash2,
 Eye,
 PauseCircle,
 PlayCircle,
 X,
 Check,
 LayoutGrid,
 Save
} from 'lucide-react';
import { TripsPage } from './TripsPage';

interface RoutesPageProps {
 routes: TransportRoute[];
 schools: School[];
 currentSchoolId: string | undefined;
 trips: Trip[];
}

export const RoutesPage: React.FC<RoutesPageProps> = ({ routes: initialRoutes, schools, currentSchoolId, trips }) => {
 const [routes, setRoutes] = useState<TransportRoute[]>(initialRoutes);
 const { colors } = useTheme();
 const operatingDays: string[] = useSelector((state: any) => state.settings?.operatingDays) || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // Helper functions for dynamic colors
  const getTypeColor = (type: string) => {
    return type === 'PICKUP' ? colors.statusScheduled : colors.statusCompleted;
  };

  const getHealthColor = (health: string) => {
    if (health === 'NORMAL') return colors.statusActive;
    if (health === 'DELAYED') return colors.statusWarning;
    return colors.statusCompleted;
  };

 const [activeTab, setActiveTab] = useState<'routes' | 'stops' | 'trips'>('routes');
 const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
 const [stopViewMode, setStopViewMode] = useState<'list' | 'map'>('list');
 const [searchTerm, setSearchTerm] = useState('');
 const [openActionId, setOpenActionId] = useState<string | null>(null);

 // Modal State
 const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
 const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 const [isAddStopModalOpen, setIsAddStopModalOpen] = useState(false);
 
 const [newRoute, setNewRoute] = useState<Partial<TransportRoute>>({ type: 'PICKUP', health: RouteHealth.NORMAL, status: 'ACTIVE' });
 const [routeTime, setRouteTime] = useState('07:00');
 const [dayTimes, setDayTimes] = useState<Record<string, string>>({});
 const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null);
 const [newStop, setNewStop] = useState('');

 // Initialize day times when operating days or time changes
 useEffect(() => {
   const initial: Record<string, string> = {};
   operatingDays.forEach(day => { initial[day] = routeTime; });
   setDayTimes(initial);
 }, [routeTime, operatingDays]);

 // Sync props to state if props change (optional, but good for keeping in sync with global mock data if it were dynamic)
 useEffect(() => {
 setRoutes(initialRoutes);
 }, [initialRoutes]);

 const filteredRoutes = routes.filter(r => {
 const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesSchool = currentSchoolId ? r.schoolId === currentSchoolId : true;
 return matchesSearch && matchesSchool;
 });

 const handleExport = () => {
 const headers = ["Route ID", "Route Name", "School", "Type", "Vehicle", "Status"];
 const rows = filteredRoutes.map(r => [
 r.id,
 r.name,
 schools.find(s => s.id === r.schoolId)?.name || 'Unknown',
 r.type,
 r.vehiclePlate,
 r.health
 ]);

 const csvContent = "data:text/csv;charset=utf-8," 
 + headers.join(",") + "\n" 
 + rows.map(e => e.join(",")).join("\n");

 const encodedUri = encodeURI(csvContent);
 const link = document.createElement("a");
 link.setAttribute("href", encodedUri);
 link.setAttribute("download", `routes_export_${new Date().toISOString().slice(0,10)}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 };

 const toggleAction = (id: string, e: React.MouseEvent) => {
 e.stopPropagation();
 setOpenActionId(openActionId === id ? null : id);
 };

 const handleCreateRoute = () => {
 if (!newRoute.name || !newRoute.schoolId) return;
 
 const createdRoute: TransportRoute = {
 id: `R${routes.length + 5}`,
 name: newRoute.name,
 schoolId: newRoute.schoolId,
 type: newRoute.type || 'PICKUP',
 status: 'ACTIVE',
 health: RouteHealth.NORMAL,
 driverId: 'D1', // Default
 vehiclePlate: newRoute.vehiclePlate || 'BUS-NEW'
 };
 
 setRoutes([...routes, createdRoute]);
 setIsCreateModalOpen(false);
 setNewRoute({ type: 'PICKUP', health: RouteHealth.NORMAL, status: 'ACTIVE' }); // Reset
 };

 const handleDelete = (id: string) => {
 if (window.confirm("Are you sure you want to delete this route?")) {
 setRoutes(routes.filter(r => r.id !== id));
 }
 };

 const toggleStatus = (id: string) => {
 setRoutes(routes.map(r => 
 r.id === id ? { ...r, status: r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : r
 ));
 };

 const openEditModal = (route: TransportRoute) => {
 setEditingRoute(route);
 setIsEditModalOpen(true);
 setOpenActionId(null);
 };

 const handleSaveEdit = () => {
 if (editingRoute) {
 setRoutes(routes.map(r => r.id === editingRoute.id ? editingRoute : r));
 setIsEditModalOpen(false);
 setEditingRoute(null);
 }
 };

 const handleAddStop = () => {
 if (newStop.trim()) {
 alert(`Stop "${newStop}" added to route.`);
 setNewStop('');
 setIsAddStopModalOpen(false);
 }
 };

 return (
 <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700" onClick={() => setOpenActionId(null)}>
 
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
 <div>
 <h1 className="text-5xl font-medium text-brand-black tracking-tight mb-2">Routes</h1>
 <p className="text-gray-500 font-normal text-xl mb-6">Manage transport corridors and schedules.</p>
 
 {/* Pill Toggle - Moved below text */}
 <div className="inline-flex p-1.5 bg-white rounded-full border border-gray-100 shadow-sm">
 <button
 onClick={() => setActiveTab('routes')}
 className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
 activeTab === 'routes'
 ? 'text-white shadow-lg'
 : 'text-gray-400 hover:text-brand-black'
 }`}
 style={activeTab === 'routes' ? { backgroundColor: colors.primary } : undefined}
 >
 Active Routes
 </button>
 <button
 onClick={() => setActiveTab('stops')}
 className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
 activeTab === 'stops'
 ? 'text-white shadow-lg'
 : 'text-gray-400 hover:text-brand-black'
 }`}
 style={activeTab === 'stops' ? { backgroundColor: colors.primary } : undefined}
 >
 Stops & Locations
 </button>
 <button
 onClick={() => setActiveTab('trips')}
 className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
 activeTab === 'trips'
 ? 'text-white shadow-lg'
 : 'text-gray-400 hover:text-brand-black'
 }`}
 style={activeTab === 'trips' ? { backgroundColor: colors.primary } : undefined}
 >
 Trip History
 </button>
 </div>
 </div>
 
 {activeTab === 'routes' && (
 <div className="flex items-center gap-3">
 <ThemedButton variant="ghost" onClick={handleExport} icon={Download}>
 Export Data
 </ThemedButton>
 <ThemedButton variant="primary" onClick={() => setIsCreateModalOpen(true)} icon={Plus}>
 Create Route
 </ThemedButton>

 {/* View Toggle */}
 <div className="flex bg-white p-1 rounded-full border border-gray-200 shadow-sm ml-2">
 <button 
 onClick={() => setViewMode('grid')}
 className={`p-2.5 rounded-full transition-all ${viewMode === 'grid' ? 'bg-brand-black text-white shadow-md' : 'text-gray-400 hover:text-brand-black'}`}
 >
 <LayoutGrid size={18} strokeWidth={2} />
 </button>
 <button 
 onClick={() => setViewMode('list')}
 className={`p-2.5 rounded-full transition-all ${viewMode === 'list' ? 'bg-brand-black text-white shadow-md' : 'text-gray-400 hover:text-brand-black'}`}
 >
 <ListIcon size={18} strokeWidth={2} />
 </button>
 </div>
 </div>
 )}
 </div>

 {activeTab === 'trips' ? (
 <TripsPage trips={trips} showHeader={false} />
 ) : activeTab === 'routes' ? (
 <>
 {viewMode === 'grid' ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
 {filteredRoutes.map((route) => (
 <div key={route.id} className="bg-white rounded-[2.5rem] p-6 shadow-soft-xl border border-gray-100 hover:shadow-2xl transition-all group relative cursor-pointer flex flex-col h-full">
 <div className="flex justify-between items-start mb-4">
 <div className="p-3 bg-brand-lilac/10 rounded-2xl text-brand-lilac">
 <RouteIcon size={24} />
 </div>
 
 <button 
 onClick={(e) => toggleAction(route.id, e)}
 className="p-2 rounded-full text-gray-300 hover:text-brand-black hover:bg-gray-50 transition-colors -mr-2 -mt-2 relative"
 >
 <MoreHorizontal size={20} />
 </button>
 {openActionId === route.id && (
 <div className="absolute right-0 top-10 mt-0 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200">
 <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors">
 <Eye size={14} /> View Details
 </button>
 <button onClick={() => openEditModal(route)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors">
 <Edit2 size={14} /> Edit Route
 </button>
 <button 
 onClick={() => toggleStatus(route.id)}
 className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors"
 >
 {route.status === 'ACTIVE' ? <PauseCircle size={14} /> : <PlayCircle size={14}/>} 
 {route.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
 </button>
 <div className="h-px bg-gray-50 my-1"></div>
 <button onClick={() => handleDelete(route.id)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors">
 <Trash2 size={14} /> Delete
 </button>
 </div>
 )}
 </div>

 <h4 className="text-xl font-bold text-brand-black mb-1">{route.name}</h4>
 <p className="text-xs text-brand-lilac font-bold mb-4">{route.id}</p>

 <div className="mb-4 space-y-2">
 <div className="flex justify-between items-center">
 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">School</span>
 <span className="text-xs font-bold text-brand-black">{schools.find(s => s.id === route.schoolId)?.name}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vehicle</span>
 <span className="text-xs font-mono font-bold text-gray-500">{route.vehiclePlate}</span>
 </div>
 </div>

 <div className="mt-auto flex gap-2">
 <span 
                className="flex-1 text-center py-2 rounded-full text-[10px] font-bold tracking-wide border"
                style={{
                  backgroundColor: `${getTypeColor(route.type)}1A`,
                  color: getTypeColor(route.type),
                  borderColor: `${getTypeColor(route.type)}33`
                }}
              >
 {route.type === 'PICKUP' ? 'PICKUP' : 'DROPOFF'}
 </span>
 
 <div className={`flex items-center gap-2 px-3 py-2 rounded-full border ${route.status === 'INACTIVE' ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-100'}`}>
 {route.status === 'INACTIVE' ? (
 <span className="text-[10px] font-bold text-gray-400 uppercase">Suspended</span>
 ) : (
 <>
 <div 
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: getHealthColor(route.health),
                    boxShadow: `0 0 8px ${getHealthColor(route.health)}`
                  }}
                ></div>
 <span className="text-[10px] font-bold text-brand-black capitalize">{route.health.toLowerCase()}</span>
 </>
 )}
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
 
 {/* Controls - White Inputs */}
 <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between">
 <div className="relative md:w-96">
 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
 <input
 type="text"
 placeholder="Search route name..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-4 focus:ring-brand-lilac/10 focus:border-brand-lilac text-sm font-medium placeholder:text-gray-400 transition-all shadow-sm"
 />
 </div>
 <div className="flex gap-3">
 <ThemedButton variant="ghost" icon={Filter}>
 Filter
 </ThemedButton>
 </div>
 </div>

 {/* Table */}
 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead className="bg-gray-50/50 text-gray-400 font-bold text-xs uppercase tracking-widest">
 <tr>
 <th className="px-8 py-6 pl-10">Route Name</th>
 <th className="px-8 py-6">School</th>
 <th className="px-8 py-6">Type</th>
 <th className="px-8 py-6">Assigned To</th>
 <th className="px-8 py-6">Status</th>
 <th className="px-8 py-6 text-right pr-10">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {filteredRoutes.map((route) => (
 <tr key={route.id} className="hover:bg-gray-50/80 transition-colors group">
 <td className="px-8 py-6 pl-10">
 <div className="font-bold text-brand-black text-base">{route.name}</div>
 <div className="text-xs font-bold text-brand-lilac mt-1">{route.id}</div>
 </td>
 <td className="px-8 py-6 text-sm font-medium text-gray-600">
 {schools.find(s => s.id === route.schoolId)?.name}
 </td>
 <td className="px-8 py-6">
 <span 
                className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border"
                style={{
                  backgroundColor: `${getTypeColor(route.type)}1A`,
                  color: getTypeColor(route.type),
                  borderColor: `${getTypeColor(route.type)}33`
                }}
              >
 {route.type === 'PICKUP' ? 'PICKUP' : 'DROPOFF'}
 </span>
 </td>
 <td className="px-8 py-6 text-sm font-mono font-medium text-gray-500">
 {route.vehiclePlate}
 </td>
 <td className="px-8 py-6">
 <div className="flex items-center gap-3">
 {route.status === 'INACTIVE' ? (
 <span className="text-xs font-bold text-gray-400 uppercase">Suspended</span>
 ) : (
 <>
 <div 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: getHealthColor(route.health),
                    boxShadow: `0 0 8px ${getHealthColor(route.health)}`
                  }}
                ></div>
 <span className="text-sm font-bold text-brand-black capitalize">{route.health.toLowerCase()}</span>
 </>
 )}
 </div>
 </td>
 <td className="px-8 py-6 text-right pr-10 relative">
 <button 
 onClick={(e) => toggleAction(route.id, e)}
 className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:bg-brand-black hover:text-white transition-all duration-300 z-10 relative"
 >
 <MoreHorizontal size={20} />
 </button>
 
 {openActionId === route.id && (
 <div className="absolute right-10 top-12 mt-0 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200">
 <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors">
 <Eye size={14} /> View Details
 </button>
 <button onClick={() => openEditModal(route)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors">
 <Edit2 size={14} /> Edit Route
 </button>
 <button 
 onClick={() => toggleStatus(route.id)}
 className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors"
 >
 {route.status === 'ACTIVE' ? <PauseCircle size={14} /> : <PlayCircle size={14}/>} 
 {route.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
 </button>
 <div className="h-px bg-gray-50 my-1"></div>
 <button onClick={() => handleDelete(route.id)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors">
 <Trash2 size={14} /> Delete
 </button>
 </div>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </>
 ) : (
 /* Stops Layout */
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[700px]">
 {/* ... existing stops content ... */}
 <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
 <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex-1 flex flex-col">
 <h3 className="font-bold text-lg text-brand-black mb-6">Route Details</h3>
 <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select Route</label>
 
 {/* White Dropdown */}
 <div className="relative">
 <select className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-brand-lilac/10 focus:border-brand-lilac mb-8 appearance-none text-brand-black shadow-sm transition-all cursor-pointer">
 {filteredRoutes.map(r => <option key={r.id}>{r.name}</option>)}
 </select>
 <div className="pointer-events-none absolute top-[22px] right-4 text-gray-400"><MoreHorizontal size={14}/></div>
 </div>
 
 <div className="p-8 bg-brand-black rounded-[2rem] text-white relative overflow-hidden shadow-2xl mb-6">
 <div className="absolute top-0 right-0 w-40 h-40 bg-brand-lilac/30 rounded-full blur-3xl -mr-12 -mt-12"></div>
 <div className="relative z-10">
 <h4 className="font-bold text-xl">Morning Pickup</h4>
 <p className="text-gray-400 text-sm mt-1 font-medium">Ref: R1-North</p>
 
 <div className="mt-10 grid grid-cols-2 gap-6">
 <div>
 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Stops</p>
 <p className="text-3xl font-light mt-1">12</p>
 </div>
 <div>
 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Est. Time</p>
 <p className="text-3xl font-light mt-1">45<span className="text-sm text-gray-500 ml-1">min</span></p>
 </div>
 </div>
 </div>
 </div>

 {/* Action Buttons */}
 <div className="grid grid-cols-2 gap-4 mt-auto">
 <ThemedButton 
 variant="ghost" 
 onClick={() => openEditModal(filteredRoutes[0])}
 icon={Edit2}
 className="py-4"
 >
 Edit Route
 </ThemedButton>
 <ThemedButton 
 variant="secondary" 
 onClick={() => setIsAddStopModalOpen(true)}
 icon={MapPin}
 className="py-4"
 >
 Add Stops
 </ThemedButton>
 </div>
 </div>
 </div>

 <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
 <div className="p-8 border-b border-gray-50 flex justify-between items-center shrink-0">
 <h3 className="font-bold text-lg text-brand-black">Stop Sequence</h3>
 <div className="flex bg-gray-50 rounded-full p-1">
 <button 
 onClick={() => setStopViewMode('list')}
 className={`p-3 rounded-full transition-all ${stopViewMode === 'list' ? 'bg-white text-brand-black shadow-sm' : 'text-gray-400 hover:text-brand-black'}`}
 >
 <List size={18}/>
 </button>
 <button 
 onClick={() => setStopViewMode('map')}
 className={`p-3 rounded-full transition-all ${stopViewMode === 'map' ? 'bg-white text-brand-black shadow-sm' : 'text-gray-400 hover:text-brand-black'}`}
 >
 <Map size={18}/>
 </button>
 </div>
 </div>
 
 <div className="flex-1 overflow-y-auto p-6 relative">
 {stopViewMode === 'list' ? (
 <div className="space-y-3">
 {[1,2,3,4,5,6].map((num) => (
 <div key={num} className="flex items-center p-5 rounded-[1.8rem] bg-white border border-gray-100 hover:border-brand-lilac/30 hover:shadow-lg hover:shadow-brand-lilac/5 transition-all group">
 <div className="w-10 h-10 rounded-full bg-brand-lilac/10 text-brand-lilac flex items-center justify-center font-bold text-sm mr-5">
 {num}
 </div>
 <div className="flex-1">
 <p className="font-bold text-brand-black text-sm">Stop Location {String.fromCharCode(64 + num)}</p>
 <p className="text-xs text-gray-400 mt-1 font-medium">123 Example Street, District {num}</p>
 </div>
 <div className="text-sm font-mono font-bold text-gray-500 mr-6">
 07:0{num} AM
 </div>
 <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
 <ThemedButton variant="icon" style={{ backgroundColor: colors.primary, color: 'white' }}><Edit2 size={16}/></ThemedButton>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="w-full h-full bg-gray-50 rounded-[2rem] flex items-center justify-center relative overflow-hidden">
 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
 <div className="flex flex-col items-center gap-3 text-gray-400 z-10">
 <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
 <RouteIcon size={32} className="text-gray-300"/>
 </div>
 <p className="font-bold text-sm">Visual Map View</p>
 <p className="text-xs">Interactive stop plotting enabled</p>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 )}

 {/* Create Route Modal */}
 {isCreateModalOpen && createPortal(
 <div className="fixed inset-0 z-[70] isolate">
 <div className="absolute inset-0 bg-brand-black/40 backdrop-blur-md" onClick={() => setIsCreateModalOpen(false)} />
 <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
 <div className="relative bg-white rounded-[2rem] p-8 w-full max-w-3xl shadow-2xl animate-in zoom-in-95 pointer-events-auto max-h-[90vh] overflow-y-auto">
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-2xl font-bold text-brand-black">Create New Route</h3>
 <button onClick={() => setIsCreateModalOpen(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X size={18}/></button>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {/* Left Column */}
 <div className="space-y-4">
 <div>
 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">School</label>
 <select 
 value={newRoute.schoolId || ''}
 onChange={(e) => setNewRoute({...newRoute, schoolId: e.target.value})}
 className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-black font-medium"
 >
 <option value="" disabled>Select School</option>
 {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
 </select>
 </div>
 <div>
 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Route Name</label>
 <input 
 type="text" 
 placeholder="e.g. Route A - North" 
 value={newRoute.name || ''}
 onChange={(e) => setNewRoute({...newRoute, name: e.target.value})}
 className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-black font-bold" 
 />
 </div>
 <div>
 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Type</label>
 <select 
 value={newRoute.type}
 onChange={(e) => setNewRoute({...newRoute, type: e.target.value as any})}
 className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-black font-medium"
 >
 <option value="PICKUP">Pickup</option>
 <option value="DROPOFF">Dropoff</option>
 </select>
 </div>
 <div>
 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Default Time</label>
 <input 
 type="time" 
 value={routeTime}
 onChange={(e) => setRouteTime(e.target.value)}
 className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-black font-bold" 
 />
 </div>

 {/* Days of the Week Schedule */}
 <div>
 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Schedule by Day</label>
 <div className="space-y-2">
 {operatingDays.map(day => (
 <div key={day} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
 <span className="text-xs font-bold text-brand-black w-24 truncate">{day}</span>
 <input 
 type="time"
 value={dayTimes[day] || routeTime}
 onChange={(e) => setDayTimes({...dayTimes, [day]: e.target.value})}
 className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-brand-black"
 />
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Right Column */}
 <div className="space-y-4">
 <div>
 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vehicle Plate</label>
 <input 
 type="text" 
 placeholder="e.g. BUS-101" 
 value={newRoute.vehiclePlate || ''}
 onChange={(e) => setNewRoute({...newRoute, vehiclePlate: e.target.value})}
 className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-black font-medium" 
 />
 </div>

 {/* Route Summary Card */}
 <div className="p-6 bg-brand-black rounded-[1.5rem] text-white relative overflow-hidden mt-4">
 <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lilac/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
 <div className="relative z-10">
 <h4 className="font-bold text-lg mb-1">Route Summary</h4>
 <p className="text-gray-400 text-xs font-medium mb-6">{newRoute.name || 'Untitled Route'}</p>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Type</p>
 <p className="text-lg font-light mt-1">{newRoute.type || 'PICKUP'}</p>
 </div>
 <div>
 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Time</p>
 <p className="text-lg font-light mt-1">{routeTime}</p>
 </div>
 <div>
 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Days</p>
 <p className="text-lg font-light mt-1">{operatingDays.length}</p>
 </div>
 <div>
 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Vehicle</p>
 <p className="text-lg font-light mt-1">{newRoute.vehiclePlate || '—'}</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 <div className="mt-8 flex justify-end">
 <ThemedButton 
 variant="primary"
 onClick={handleCreateRoute}
 icon={Check}
 >
 Create Route
 </ThemedButton>
 </div>
 </div>
 </div>
 </div>,
 document.body
 )}

 {/* Edit Route Modal */}
 {isEditModalOpen && editingRoute && createPortal(
 <div className="fixed inset-0 z-[70] isolate">
 <div className="absolute inset-0 bg-brand-black/40 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />
 <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
 <div className="relative bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 pointer-events-auto">
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-2xl font-bold text-brand-black">Edit Route</h3>
 <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X size={18}/></button>
 </div>
 <div className="space-y-4">
 <div>
 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Route Name</label>
 <input 
 type="text" 
 value={editingRoute.name}
 onChange={(e) => setEditingRoute({ ...editingRoute, name: e.target.value })}
 className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-black font-bold" 
 />
 </div>
 <div>
 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vehicle</label>
 <input 
 type="text" 
 value={editingRoute.vehiclePlate}
 onChange={(e) => setEditingRoute({ ...editingRoute, vehiclePlate: e.target.value })}
 className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-black font-medium" 
 />
 </div>
 </div>
 <div className="mt-8 flex justify-end">
 <ThemedButton 
 variant="primary"
 onClick={handleSaveEdit}
 icon={Save}
 >
 Save Changes
 </ThemedButton>
 </div>
 </div>
 </div>
 </div>,
 document.body
 )}

 {/* Add Stop Modal */}
 {isAddStopModalOpen && createPortal(
 <div className="fixed inset-0 z-[70] isolate">
 <div className="absolute inset-0 bg-brand-black/40 backdrop-blur-md" onClick={() => setIsAddStopModalOpen(false)} />
 <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
 <div className="relative bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 pointer-events-auto">
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-2xl font-bold text-brand-black">Add New Stop</h3>
 <button onClick={() => setIsAddStopModalOpen(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X size={18}/></button>
 </div>
 <div className="space-y-4">
 <div>
 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Stop Address / Name</label>
 <input 
 type="text" 
 placeholder="e.g. 123 Main St"
 value={newStop}
 onChange={(e) => setNewStop(e.target.value)}
 className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-black font-bold" 
 autoFocus
 />
 </div>
 </div>
 <div className="mt-8 flex justify-end">
 <ThemedButton 
 variant="primary"
 onClick={handleAddStop}
 icon={Plus}
 >
 Add Stop
 </ThemedButton>
 </div>
 </div>
 </div>
 </div>,
 document.body
 )}

 </div>
 );
};