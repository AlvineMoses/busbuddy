import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '../src/hooks/useTheme';
import { ThemedButton } from '../src/components/ThemedComponents';
import { ThemedModal } from '../src/components/ThemedModal';
import { ThemedInput, ThemedSelect, ThemedTimeInput } from '../src/components/ThemedFormField';
import { TransportRoute, RouteHealth, School, Trip, Student, Location, Driver, Shift } from '../types';
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
 Check,
 LayoutGrid,
 Save,
 ArrowRight,
 X,
 User,
 ChevronDown
} from 'lucide-react';
import { ThemedDataTable } from '../src/components/ThemedDataTable';
import { TripsPage } from './TripsPage';
import { APIProvider, Map as GoogleMap, Marker } from '@vis.gl/react-google-maps';
import { MOCK_DRIVERS } from '../services/mockData';

interface RoutesPageProps {
 routes: TransportRoute[];
 schools: School[];
 currentSchoolId: string | undefined;
 trips: Trip[];
}

const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
const DEFAULT_CENTER = { lat: -1.286389, lng: 36.817223 }; // Default to Nairobi

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
 const [stopViewMode, setStopViewMode] = useState<'list' | 'map'>('map');
 const [searchTerm, setSearchTerm] = useState('');
 const [openActionId, setOpenActionId] = useState<string | null>(null);

 // Modal State
 const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
 const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 const [isAddStopModalOpen, setIsAddStopModalOpen] = useState(false);
 const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
 
 const [newRoute, setNewRoute] = useState<Partial<TransportRoute>>({ type: 'PICKUP', health: RouteHealth.NORMAL, status: 'ACTIVE' });
 const [routeTime, setRouteTime] = useState('07:00');
 const [dayTimes, setDayTimes] = useState<Record<string, string>>({});
 const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null);
 const [newStop, setNewStop] = useState('');

 // Stops tab state
 const [selectedStopRouteId, setSelectedStopRouteId] = useState<string>('');
 const [stopDirection, setStopDirection] = useState<'PICKUP' | 'DROPOFF'>('PICKUP');
 const [routeStops, setRouteStops] = useState<Array<{ name: string; address: string; time: string; lat: number; lng: number; studentId?: string }>>([]);
 const [editingStopIndex, setEditingStopIndex] = useState<number | null>(null);
 const [editStopForm, setEditStopForm] = useState({ name: '', address: '', time: '' });
 const [editRouteTime, setEditRouteTime] = useState('07:00');
 const [editDayTimes, setEditDayTimes] = useState<Record<string, string>>({});

 // Student management state
 const [mockStudents, setMockStudents] = useState<Student[]>([
   {
     id: 'STU1',
     name: 'Emma Johnson',
     school: 'S1',
     grade: 'Grade 5',
     guardian: 'Sarah Johnson',
     status: 'WAITING',
     pickupLocation: { lat: -1.2921, lng: 36.8219, address: 'Karen, Nairobi' },
     dropoffLocation: { lat: -1.2864, lng: 36.8172, address: 'Westlands Primary School' },
     assignedRoutes: []
   },
   {
     id: 'STU2',
     name: 'Liam Smith',
     school: 'S1',
     grade: 'Grade 6',
     guardian: 'Michael Smith',
     status: 'WAITING',
     pickupLocation: { lat: -1.2850, lng: 36.8250, address: 'Parklands, Nairobi' },
     dropoffLocation: { lat: -1.2864, lng: 36.8172, address: 'Westlands Primary School' },
     assignedRoutes: []
   },
   {
     id: 'STU3',
     name: 'Sophia Williams',
     school: 'S1',
     grade: 'Grade 4',
     guardian: 'Jennifer Williams',
     status: 'WAITING',
     pickupLocation: { lat: -1.2800, lng: 36.8150, address: 'Kilimani, Nairobi' },
     dropoffLocation: { lat: -1.2864, lng: 36.8172, address: 'Westlands Primary School' },
     assignedRoutes: []
   },
   {
     id: 'STU4',
     name: 'Noah Brown',
     school: 'S1',
     grade: 'Grade 5',
     guardian: 'David Brown',
     status: 'WAITING',
     pickupLocation: { lat: -1.2920, lng: 36.8100, address: 'Lavington, Nairobi' },
     dropoffLocation: { lat: -1.2864, lng: 36.8172, address: 'Westlands Primary School' },
     assignedRoutes: []
   },
   {
     id: 'STU5',
     name: 'Olivia Davis',
     school: 'S1',
     grade: 'Grade 6',
     guardian: 'Emily Davis',
     status: 'WAITING',
     pickupLocation: { lat: -1.2750, lng: 36.8200, address: 'Hurlingham, Nairobi' },
     dropoffLocation: { lat: -1.2864, lng: 36.8172, address: 'Westlands Primary School' },
     assignedRoutes: []
   },
   {
     id: 'STU6',
     name: 'Ava Martinez',
     school: 'S1',
     grade: 'Grade 4',
     guardian: 'Carlos Martinez',
     status: 'WAITING',
     pickupLocation: { lat: -1.2880, lng: 36.8300, address: 'Eastleigh, Nairobi' },
     dropoffLocation: { lat: -1.2864, lng: 36.8172, address: 'Westlands Primary School' },
     assignedRoutes: []
   }
 ]);
 const [studentSearchTerm, setStudentSearchTerm] = useState('');
 const [showStudentDropdown, setShowStudentDropdown] = useState(false);

 // Driver assignment state
 const [mockDrivers] = useState<Driver[]>(MOCK_DRIVERS as Driver[]);
 const [driverForm, setDriverForm] = useState({
   driverId: '',
   vehicle: '',
   phone: '',
   shiftDate: new Date().toISOString().split('T')[0],
   shiftTime: '07:00',
   recurring: false,
   recurringDates: [] as string[]
 });

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

 // Initialize selectedStopRouteId when filteredRoutes change
 useEffect(() => {
   if (filteredRoutes.length > 0 && !filteredRoutes.find(r => r.id === selectedStopRouteId)) {
     setSelectedStopRouteId(filteredRoutes[0].id);
   }
 }, [filteredRoutes, selectedStopRouteId]);

 // Load stops for selected route from student assignments
 useEffect(() => {
   if (selectedStopRouteId) {
     // Get students assigned to this route
     const assignedStudents = mockStudents.filter(s => s.assignedRoutes?.includes(selectedStopRouteId));
     
     // Generate stops from student pickup/dropoff locations
     const stops = assignedStudents.map((student, index) => {
       const location = stopDirection === 'PICKUP' ? student.pickupLocation : student.dropoffLocation;
       return {
         studentId: student.id,
         name: student.name,
         address: location?.address || 'Unknown location',
         time: `07:${(index * 5).toString().padStart(2, '0')} AM`, // Mock time increments
         lat: location?.lat || -1.2864,
         lng: location?.lng || 36.8172
       };
     });
     
     setRouteStops(stops);
   }
 }, [selectedStopRouteId, mockStudents, stopDirection]);

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
 setEditRouteTime('07:00');
 const initial: Record<string, string> = {};
 operatingDays.forEach(day => { initial[day] = '07:00'; });
 setEditDayTimes(initial);
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

 // Toggle student assignment to selected route
 const toggleStudentAssignment = (studentId: string) => {
   setMockStudents(mockStudents.map(s => {
     if (s.id === studentId) {
       const currentRoutes = s.assignedRoutes || [];
       const isAssigned = currentRoutes.includes(selectedStopRouteId);
       return {
         ...s,
         assignedRoutes: isAssigned
           ? currentRoutes.filter(id => id !== selectedStopRouteId)
           : [...currentRoutes, selectedStopRouteId]
       };
     }
     return s;
   }));
 };

 // Handle driver assignment to route
 const handleAddDriver = () => {
   if (!driverForm.driverId) {
     alert('Please select a driver');
     return;
   }
   
   // Check for duplicate: same school + driver + route + date/time
   const selectedRoute = filteredRoutes.find(r => r.id === selectedStopRouteId);
   // In a real implementation, check against existing shifts/assignments
   // For now, just show success and close modal
   
   console.log('Creating shift assignment:', {
     routeId: selectedStopRouteId,
     schoolId: selectedRoute?.schoolId,
     driverId: driverForm.driverId,
     vehicle: driverForm.vehicle,
     phone: driverForm.phone,
     shiftDate: driverForm.shiftDate,
     shiftTime: driverForm.shiftTime,
     recurring: driverForm.recurring,
     recurringDates: driverForm.recurringDates
   });
   
   alert('Driver assigned to route successfully!');
   setIsAddDriverModalOpen(false);
   setDriverForm({
     driverId: '',
     vehicle: '',
     phone: '',
     shiftDate: new Date().toISOString().split('T')[0],
     shiftTime: '07:00',
     recurring: false,
     recurringDates: []
   });
 };

 const handleDriverSelect = (driverId: string) => {
   const driver = mockDrivers.find(d => d.id === driverId);
   if (driver) {
     setDriverForm({
       ...driverForm,
       driverId,
       vehicle: driver.vehicle,
       phone: driver.phone
     });
   }
 };

 const handleAddStop = () => {
 if (newStop.trim()) {
   const newStopData = {
     name: newStop,
     address: 'New address',
     time: '07:00 AM',
     lat: DEFAULT_CENTER.lat + (Math.random() - 0.5) * 0.01,
     lng: DEFAULT_CENTER.lng + (Math.random() - 0.5) * 0.01,
   };
   setRouteStops([...routeStops, newStopData]);
   setNewStop('');
   setIsAddStopModalOpen(false);
 }
 };

 const handleRemoveStop = (index: number) => {
   setRouteStops(routeStops.filter((_, i) => i !== index));
 };

 const handleEditStop = (index: number) => {
   const stop = routeStops[index];
   setEditStopForm({ name: stop.name, address: stop.address, time: stop.time });
   setEditingStopIndex(index);
 };

 const handleSaveStopEdit = () => {
   if (editingStopIndex !== null) {
     setRouteStops(routeStops.map((s, i) => i === editingStopIndex ? { ...s, ...editStopForm } : s));
     setEditingStopIndex(null);
   }
 };

 // Mock stop positions for the map (in production, these would come from real data)
 const getMockStopPositions = () => [
   { lat: -1.286389, lng: 36.817223, name: 'Stop Location A', address: '123 Example Street, District 1', time: '07:01 AM' },
   { lat: -1.288500, lng: 36.819000, name: 'Stop Location B', address: '123 Example Street, District 2', time: '07:02 AM' },
   { lat: -1.290000, lng: 36.821000, name: 'Stop Location C', address: '123 Example Street, District 3', time: '07:03 AM' },
   { lat: -1.291500, lng: 36.823000, name: 'Stop Location D', address: '123 Example Street, District 4', time: '07:04 AM' },
   { lat: -1.293000, lng: 36.825000, name: 'Stop Location E', address: '123 Example Street, District 5', time: '07:05 AM' },
   { lat: -1.294500, lng: 36.827000, name: 'Stop Location F', address: '123 Example Street, District 6', time: '07:06 AM' },
 ];

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
 <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-125">
 
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
 <ThemedDataTable
  columns={[
    {
      header: 'Route Name',
      key: 'name',
      render: (route) => (
        <>
          <div className="font-bold text-brand-black text-base">{route.name}</div>
          <div className="text-xs font-bold text-brand-lilac mt-1">{route.id}</div>
        </>
      ),
    },
    {
      header: 'School',
      key: 'school',
      cellClassName: 'text-sm font-medium text-gray-600',
      render: (route) => schools.find(s => s.id === route.schoolId)?.name,
    },
    {
      header: 'Type',
      key: 'type',
      render: (route) => (
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
      ),
    },
    {
      header: 'Assigned To',
      key: 'assignedTo',
      cellClassName: 'text-sm font-mono font-medium text-gray-500',
      render: (route) => route.vehiclePlate,
    },
    {
      header: 'Status',
      key: 'status',
      render: (route) => (
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
      ),
    },
  ]}
  data={filteredRoutes}
  rowKey={(route) => route.id}
  actions={[
    {
      label: 'View Details',
      icon: <Eye size={14} />,
      onClick: () => {},
    },
    {
      label: 'Edit Route',
      icon: <Edit2 size={14} />,
      onClick: (route) => openEditModal(route),
    },
    {
      label: 'Suspend',
      icon: <PauseCircle size={14} />,
      onClick: (route) => toggleStatus(route.id),
      hidden: (route) => route.status !== 'ACTIVE',
    },
    {
      label: 'Activate',
      icon: <PlayCircle size={14} />,
      onClick: (route) => toggleStatus(route.id),
      hidden: (route) => route.status === 'ACTIVE',
    },
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      onClick: (route) => handleDelete(route.id),
      divider: true,
      className: 'text-red-500 hover:bg-red-50',
    },
  ]}
 />
 </div>
 )}
 </>
 ) : (
 /* Stops Layout */
 <div className="space-y-6">
   {/* Horizontal Timeline - Only show when stops exist */}
   {routeStops.length > 0 && (
     <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-gray-100">
       <div className="flex items-center justify-between mb-3">
         <h3 className="font-bold text-sm text-brand-black">Route Timeline</h3>
         <div className="flex items-center gap-2 text-xs text-gray-400">
           <span className="font-bold" style={{ color: stopDirection === 'PICKUP' ? colors.statusScheduled : colors.statusCompleted }}>
             {stopDirection === 'PICKUP' ? 'Home → School' : 'School → Home'}
           </span>
         </div>
       </div>
       <div className="flex items-center overflow-x-auto pb-2 gap-0">
         {routeStops.map((stop, idx) => {
             const isFirst = idx === 0;
             const isLast = idx === routeStops.length - 1;
             const label = isFirst
               ? (stopDirection === 'PICKUP' ? 'Home' : 'School')
               : isLast
               ? (stopDirection === 'PICKUP' ? 'School' : 'Home')
               : null;
             return (
               <React.Fragment key={idx}>
                 <div className="flex flex-col items-center shrink-0 min-w-20">
                   <button
                     onClick={() => handleEditStop(idx)}
                     className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm hover:scale-110 transition-transform cursor-pointer"
                     style={{ backgroundColor: (isFirst || isLast) ? colors.primary : '#94a3b8' }}
                     title={`Click to edit ${stop.name}`}
                   >
                     {idx + 1}
                   </button>
                   <p className="text-[10px] font-bold text-brand-black mt-1.5 text-center max-w-18 truncate">{stop.name}</p>
                   <p className="text-[10px] text-gray-400">{stop.time}</p>
                   {label && <span className="text-[9px] font-bold mt-0.5 px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.primary}1A`, color: colors.primary }}>{label}</span>}
                 </div>
                 {!isLast && (
                   <div className="flex-1 min-w-6 h-0.5 bg-gray-200 mx-1 relative -top-4">
                     <ArrowRight size={10} className="absolute -right-1 -top-1 text-gray-300" />
                   </div>
                 )}
               </React.Fragment>
             );
           })}
           {/* Add Stop Button */}
           <button
             onClick={() => setShowStudentDropdown(true)}
             className="shrink-0 ml-2 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm hover:scale-110 transition-all"
             style={{ backgroundColor: colors.primary }}
             title="Add another stop"
           >
             <Plus size={16} />
           </button>
       </div>
     </div>
   )}

   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-150">
     {/* Left Panel - Route Details */}
     <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
       <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex-1 flex flex-col">
         <h3 className="font-bold text-lg text-brand-black mb-4">Route Details</h3>

         {/* Direction Toggle */}
         <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Direction</label>
         <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
           <button
             onClick={() => setStopDirection('PICKUP')}
             className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
               stopDirection === 'PICKUP'
                 ? 'bg-white text-brand-black shadow-sm'
                 : 'text-gray-400 hover:text-gray-600'
             }`}
           >
             Pickup
           </button>
           <button
             onClick={() => setStopDirection('DROPOFF')}
             className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
               stopDirection === 'DROPOFF'
                 ? 'bg-white text-brand-black shadow-sm'
                 : 'text-gray-400 hover:text-gray-600'
             }`}
           >
             Dropoff
           </button>
         </div>

         {(() => {
           const selectedRoute = filteredRoutes.find(r => r.id === selectedStopRouteId) || filteredRoutes[0];
           if (!selectedRoute) return null;
           return (
             <div className="p-8 bg-brand-black rounded-4xl text-white relative overflow-hidden shadow-2xl mb-6">
               <div className="absolute top-0 right-0 w-40 h-40 bg-brand-lilac/30 rounded-full blur-3xl -mr-12 -mt-12"></div>
               <div className="relative z-10">
                 <h4 className="font-bold text-xl">{selectedRoute.name}</h4>
                 <p className="text-gray-400 text-sm mt-1 font-medium">
                   {stopDirection === 'PICKUP' ? 'Pickup' : 'Dropoff'} · Ref: {selectedRoute.id}
                 </p>
                 <div className="mt-8 grid grid-cols-2 gap-6">
                   <div>
                     <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Stops</p>
                     <p className="text-3xl font-light mt-1">{routeStops.length}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Est. Time</p>
                     <p className="text-3xl font-light mt-1">{routeStops.length * 5}<span className="text-sm text-gray-500 ml-1">min</span></p>
                   </div>
                 </div>
               </div>
             </div>
           );
         })()}

         {/* Action Buttons */}
         <div className="grid grid-cols-2 gap-4 mt-auto">
           <ThemedButton
             variant="ghost"
             onClick={() => {
               const selected = filteredRoutes.find(r => r.id === selectedStopRouteId);
               if (selected) openEditModal(selected);
             }}
             icon={Edit2}
             className="py-4"
           >
             Edit Route
           </ThemedButton>
           <ThemedButton
             variant="secondary"
             onClick={() => setIsAddDriverModalOpen(true)}
             icon={User}
             className="py-4"
           >
             Add Driver
           </ThemedButton>
         </div>
       </div>
     </div>

     {/* Right Panel - Stop Sequence */}
     <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
       <div className="p-8 border-b border-gray-50 grid grid-cols-3 gap-4 items-center shrink-0">
         {/* Left Column: Route Selector */}
         <div className="relative">
           <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Route</label>
           <div className="relative">
             <select
               className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-lilac/20 focus:border-brand-lilac appearance-none text-brand-black transition-all cursor-pointer"
               value={selectedStopRouteId}
               onChange={(e) => setSelectedStopRouteId(e.target.value)}
             >
               {filteredRoutes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
             </select>
             <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-3 text-gray-400">
               <ChevronDown size={14}/>
             </div>
           </div>
         </div>

         {/* Middle Column: Student Assignment Dropdown */}
         <div className="relative">
           <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Students</label>
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={14} />
             <input
               type="text"
               placeholder="Search students..."
               value={studentSearchTerm}
               onChange={(e) => setStudentSearchTerm(e.target.value)}
               onFocus={() => setShowStudentDropdown(true)}
               onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)}
               className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-brand-lilac/20 focus:border-brand-lilac text-brand-black transition-all"
             />
             <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-3 text-gray-400">
               <ChevronDown size={14}/>
             </div>
             
             {/* Student Dropdown */}
             {showStudentDropdown && (
               <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
                 {mockStudents
                   .filter(student => 
                     (currentSchoolId ? student.school === currentSchoolId : true) &&
                     student.name.toLowerCase().includes(studentSearchTerm.toLowerCase())
                   )
                   .map(student => {
                     const isAssigned = student.assignedRoutes?.includes(selectedStopRouteId);
                     return (
                       <button
                         key={student.id}
                         onClick={() => toggleStudentAssignment(student.id)}
                         className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                       >
                         <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${isAssigned ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-400'}`}>
                           {isAssigned ? <Check size={12} /> : <X size={12} />}
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-sm font-bold text-brand-black truncate">{student.name}</p>
                           <p className="text-xs text-gray-400 truncate">{student.grade}</p>
                         </div>
                       </button>
                     );
                   })}
                 {mockStudents.filter(s => (currentSchoolId ? s.school === currentSchoolId : true) && s.name.toLowerCase().includes(studentSearchTerm.toLowerCase())).length === 0 && (
                   <div className="px-4 py-8 text-center text-gray-400 text-sm">
                     No students found
                   </div>
                 )}
               </div>
             )}
           </div>
         </div>

         {/* Right Column: View Toggle */}
         <div className="flex justify-end">
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
       </div>
       

       <div className="flex-1 overflow-y-auto p-6 relative">
         {stopViewMode === 'list' ? (
           <div className="space-y-3">
             {routeStops.length === 0 && (
               <div className="text-center py-16 text-gray-400">
                 <User size={40} className="mx-auto mb-3 opacity-30" />
                 <p className="font-bold text-sm">No students assigned to this route</p>
                 <p className="text-xs mt-1">Use the student dropdown above to assign students to this route.</p>
               </div>
             )}
             {routeStops.map((stop, idx) => (
               <div key={idx} className="flex items-center p-5 rounded-[1.8rem] bg-white border border-gray-100 hover:border-brand-lilac/30 hover:shadow-lg hover:shadow-brand-lilac/5 transition-all group">
                 <div className="w-10 h-10 rounded-full bg-brand-lilac/10 text-brand-lilac flex items-center justify-center font-bold text-sm mr-5 shrink-0">
                   {idx + 1}
                 </div>
                 {editingStopIndex === idx ? (
                   <div className="flex-1 flex items-center gap-3">
                     <input
                       type="text"
                       value={editStopForm.name}
                       onChange={e => setEditStopForm({ ...editStopForm, name: e.target.value })}
                       className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-lilac/20 focus:border-brand-lilac outline-none"
                       placeholder="Stop name"
                     />
                     <input
                       type="text"
                       value={editStopForm.time}
                       onChange={e => setEditStopForm({ ...editStopForm, time: e.target.value })}
                       className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-brand-lilac/20 focus:border-brand-lilac outline-none"
                       placeholder="Time"
                     />
                     <ThemedButton variant="primary" onClick={handleSaveStopEdit} icon={Check} className="py-2! px-3!">Save</ThemedButton>
                     <ThemedButton variant="cancel" onClick={() => setEditingStopIndex(null)} className="py-2! px-3!">Cancel</ThemedButton>
                   </div>
                 ) : (
                   <>
                     <div className="flex-1 min-w-0">
                       <p className="font-bold text-brand-black text-sm">{stop.name}</p>
                       <p className="text-xs text-gray-400 mt-1 font-medium truncate">{stop.address}</p>
                     </div>
                     <div className="text-sm font-mono font-bold text-gray-500 mr-6 shrink-0">
                       {stop.time}
                     </div>
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 shrink-0">
                       <button
                         onClick={() => handleEditStop(idx)}
                         className="p-2 rounded-xl transition-colors"
                         style={{ backgroundColor: `${colors.primary}1A`, color: colors.primary }}
                         title="Edit stop"
                       >
                         <Edit2 size={14}/>
                       </button>
                       <button
                         onClick={() => handleRemoveStop(idx)}
                         className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                         title="Remove stop"
                       >
                         <Trash2 size={14}/>
                       </button>
                     </div>
                   </>
                 )}
               </div>
             ))}
           </div>
         ) : (
           <div className="w-full h-full rounded-4xl overflow-hidden">
             {!GOOGLE_MAPS_API_KEY ? (
               <div className="w-full h-full bg-gray-50 rounded-4xl flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                 <div className="flex flex-col items-center gap-3 text-gray-400 z-10">
                   <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
                     <RouteIcon size={32} className="text-gray-300"/>
                   </div>
                   <p className="font-bold text-sm">Map Unavailable</p>
                   <p className="text-xs">Google Maps API key not configured</p>
                 </div>
               </div>
             ) : (
               <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                 <GoogleMap
                   defaultCenter={routeStops.length > 0 ? { lat: routeStops[0].lat, lng: routeStops[0].lng } : DEFAULT_CENTER}
                   defaultZoom={13}
                   mapId="busbudd-stops-map"
                   disableDefaultUI={true}
                   gestureHandling="greedy"
                   style={{ width: '100%', height: '100%', borderRadius: '2rem' }}
                 >
                   {routeStops.map((stop, index) => (
                     <Marker
                       key={index}
                       position={{ lat: stop.lat, lng: stop.lng }}
                       title={`${index + 1}. ${stop.name}`}
                     />
                   ))}
                 </GoogleMap>
               </APIProvider>
             )}
           </div>
         )}
       </div>
     </div>
   </div>
 </div>
 )}

 {/* Create Route Modal */}
 <ThemedModal
   isOpen={isCreateModalOpen}
   onClose={() => setIsCreateModalOpen(false)}
   title="Create New Route"
   size="2xl"
   className="max-h-[90vh] overflow-y-auto"
   footer={
     <ThemedButton 
       variant="primary"
       onClick={handleCreateRoute}
       icon={Check}
     >
       Create Route
     </ThemedButton>
   }
 >
   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
     {/* Left Column */}
     <div className="space-y-4">
       <ThemedSelect
         label="School"
         value={newRoute.schoolId || ''}
         onChange={(e) => setNewRoute({...newRoute, schoolId: e.target.value})}
       >
         <option value="" disabled>Select School</option>
         {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
       </ThemedSelect>

       <ThemedInput
         label="Route Name"
         type="text"
         placeholder="e.g. Route A - North"
         value={newRoute.name || ''}
         onChange={(e) => setNewRoute({...newRoute, name: e.target.value})}
       />

       <ThemedSelect
         label="Type"
         value={newRoute.type}
         onChange={(e) => setNewRoute({...newRoute, type: e.target.value as any})}
       >
         <option value="PICKUP">Pickup</option>
         <option value="DROPOFF">Dropoff</option>
       </ThemedSelect>

       <ThemedTimeInput
         label="Default Time"
         value={routeTime}
         onChange={(e) => setRouteTime(e.target.value)}
       />

       {/* Days of the Week Schedule */}
       <div>
         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Schedule by Day</label>
         <div className="grid grid-cols-2 gap-2">
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
       <ThemedInput
         label="Vehicle Plate"
         type="text"
         placeholder="e.g. BUS-101"
         value={newRoute.vehiclePlate || ''}
         onChange={(e) => setNewRoute({...newRoute, vehiclePlate: e.target.value})}
       />

       {/* Route Summary Card */}
       <div className="p-6 bg-brand-black rounded-3xl text-white relative overflow-hidden mt-4">
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
 </ThemedModal>

 {/* Edit Route Modal */}
 <ThemedModal
   isOpen={isEditModalOpen && editingRoute !== null}
   onClose={() => setIsEditModalOpen(false)}
   title="Edit Route"
   size="2xl"
   className="max-h-[90vh] overflow-y-auto"
   footer={
     <ThemedButton 
       variant="primary"
       onClick={handleSaveEdit}
       icon={Save}
     >
       Save Changes
     </ThemedButton>
   }
 >
   {editingRoute && (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
       {/* Left Column */}
       <div className="space-y-4">
         <ThemedSelect
           label="School"
           value={editingRoute.schoolId}
           onChange={(e) => setEditingRoute({ ...editingRoute, schoolId: e.target.value })}
         >
           <option value="" disabled>Select School</option>
           {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
         </ThemedSelect>

         <ThemedInput
           label="Route Name"
           type="text"
           placeholder="e.g. Route A - North"
           value={editingRoute.name}
           onChange={(e) => setEditingRoute({ ...editingRoute, name: e.target.value })}
         />

         <ThemedSelect
           label="Type"
           value={editingRoute.type}
           onChange={(e) => setEditingRoute({ ...editingRoute, type: e.target.value as any })}
         >
           <option value="PICKUP">Pickup</option>
           <option value="DROPOFF">Dropoff</option>
         </ThemedSelect>

         <ThemedTimeInput
           label="Default Time"
           value={editRouteTime}
           onChange={(e) => {
             setEditRouteTime(e.target.value);
             const updated: Record<string, string> = {};
             operatingDays.forEach(day => { updated[day] = e.target.value; });
             setEditDayTimes(updated);
           }}
         />

         {/* Days of the Week Schedule */}
         <div>
           <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Schedule by Day</label>
           <div className="grid grid-cols-2 gap-2">
             {operatingDays.map(day => (
               <div key={day} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                 <span className="text-xs font-bold text-brand-black w-24 truncate">{day}</span>
                 <input 
                   type="time"
                   value={editDayTimes[day] || editRouteTime}
                   onChange={(e) => setEditDayTimes({...editDayTimes, [day]: e.target.value})}
                   className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-brand-black"
                 />
               </div>
             ))}
           </div>
         </div>
       </div>

       {/* Right Column */}
       <div className="space-y-4">
         <ThemedInput
           label="Vehicle Plate"
           type="text"
           placeholder="e.g. BUS-101"
           value={editingRoute.vehiclePlate}
           onChange={(e) => setEditingRoute({ ...editingRoute, vehiclePlate: e.target.value })}
         />

         <ThemedSelect
           label="Status"
           value={editingRoute.status}
           onChange={(e) => setEditingRoute({ ...editingRoute, status: e.target.value as any })}
         >
           <option value="ACTIVE">Active</option>
           <option value="INACTIVE">Inactive</option>
         </ThemedSelect>

         {/* Route Summary Card */}
         <div className="p-6 bg-brand-black rounded-3xl text-white relative overflow-hidden mt-4">
           <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lilac/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
           <div className="relative z-10">
             <h4 className="font-bold text-lg mb-1">Route Summary</h4>
             <p className="text-gray-400 text-xs font-medium mb-6">{editingRoute.name || 'Untitled Route'}</p>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Type</p>
                 <p className="text-lg font-light mt-1">{editingRoute.type || 'PICKUP'}</p>
               </div>
               <div>
                 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Time</p>
                 <p className="text-lg font-light mt-1">{editRouteTime}</p>
               </div>
               <div>
                 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">School</p>
                 <p className="text-lg font-light mt-1 truncate">{schools.find(s => s.id === editingRoute.schoolId)?.name || '—'}</p>
               </div>
               <div>
                 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Vehicle</p>
                 <p className="text-lg font-light mt-1">{editingRoute.vehiclePlate || '—'}</p>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
   )}
 </ThemedModal>

 {/* Add Stop Modal */}
 <ThemedModal
   isOpen={isAddStopModalOpen}
   onClose={() => setIsAddStopModalOpen(false)}
   title="Add New Stop"
   size="lg"
   footer={
     <ThemedButton 
       variant="primary"
       onClick={handleAddStop}
       icon={Plus}
     >
       Add Stop
     </ThemedButton>
   }
 >
   <ThemedInput
     label="Stop Address / Name"
     type="text"
     placeholder="e.g. 123 Main St"
     value={newStop}
     onChange={(e) => setNewStop(e.target.value)}
     autoFocus
   />
 </ThemedModal>

 {/* Add Driver to Route Modal */}
 <ThemedModal
   isOpen={isAddDriverModalOpen}
   onClose={() => setIsAddDriverModalOpen(false)}
   title="Add Driver to Route"
   size="lg"
   footer={
     <ThemedButton 
       variant="primary"
       onClick={handleAddDriver}
       icon={Check}
     >
       Confirm Assignment
     </ThemedButton>
   }
 >
   <div className="space-y-6">
     {/* Institution - Read Only */}
     <ThemedInput
       label="Institution"
       type="text"
       value={schools.find(s => s.id === filteredRoutes.find(r => r.id === selectedStopRouteId)?.schoolId)?.name || ''}
       disabled
     />

     {/* Driver Name Dropdown */}
     <div>
       <ThemedSelect
         label="Driver Name"
         value={driverForm.driverId}
         onChange={(e) => handleDriverSelect(e.target.value)}
       >
         <option value="">Select a driver...</option>
         {mockDrivers.map(driver => (
           <option key={driver.id} value={driver.id}>
             {driver.name} ({driver.status})
           </option>
         ))}
       </ThemedSelect>
     </div>

     {/* Driver Profile Photo */}
     {driverForm.driverId && (
       <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
         <img 
           src={mockDrivers.find(d => d.id === driverForm.driverId)?.avatar}
           alt="Driver"
           className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
         />
         <div>
           <p className="font-bold text-sm text-brand-black">
             {mockDrivers.find(d => d.id === driverForm.driverId)?.name}
           </p>
           <p className="text-xs text-gray-400">
             License: {mockDrivers.find(d => d.id === driverForm.driverId)?.license}
           </p>
         </div>
       </div>
     )}

     {/* Vehicle - Editable */}
     <ThemedInput
       label="Vehicle"
       type="text"
       placeholder="e.g. Toyota Coaster (KAA 101B)"
       value={driverForm.vehicle}
       onChange={(e) => setDriverForm({ ...driverForm, vehicle: e.target.value })}
     />

     {/* Driver Phone - Editable */}
     <ThemedInput
       label="Driver Phone Number"
       type="tel"
       placeholder="+254 712 345 678"
       value={driverForm.phone}
       onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
     />

     {/* Shift Date and Time */}
     <div className="grid grid-cols-2 gap-4">
       <ThemedInput
         label="Shift Date"
         type="date"
         value={driverForm.shiftDate}
         onChange={(e) => setDriverForm({ ...driverForm, shiftDate: e.target.value })}
       />
       <ThemedInput
         label="Shift Time"
         type="time"
         value={driverForm.shiftTime}
         onChange={(e) => setDriverForm({ ...driverForm, shiftTime: e.target.value })}
       />
     </div>

     {/* Recurring Toggle */}
     <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
       <input
         type="checkbox"
         id="recurring"
         checked={driverForm.recurring}
         onChange={(e) => setDriverForm({ ...driverForm, recurring: e.target.checked })}
         className="w-5 h-5 rounded border-gray-300 text-brand-lilac focus:ring-brand-lilac/20"
       />
       <label htmlFor="recurring" className="text-sm font-bold text-brand-black cursor-pointer">
         Recurring Assignment
       </label>
     </div>

     {/* Multi-Date Selector (shown when recurring is enabled) */}
     {driverForm.recurring && (
       <div>
         <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
           Select Recurring Dates
         </label>
         <div className="p-4 bg-gray-50 rounded-xl space-y-2">
           <p className="text-xs text-gray-500 mb-3">
             Select additional dates for this recurring assignment
           </p>
           <input
             type="date"
             multiple
             className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-lilac/20 focus:border-brand-lilac"
             onChange={(e) => {
               const date = e.target.value;
               if (date && !driverForm.recurringDates.includes(date)) {
                 setDriverForm({
                   ...driverForm,
                   recurringDates: [...driverForm.recurringDates, date]
                 });
               }
             }}
           />
           {driverForm.recurringDates.length > 0 && (
             <div className="mt-3 space-y-2">
               {driverForm.recurringDates.map((date, idx) => (
                 <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg">
                   <span className="text-sm font-medium">{new Date(date).toLocaleDateString()}</span>
                   <button
                     onClick={() => setDriverForm({
                       ...driverForm,
                       recurringDates: driverForm.recurringDates.filter((_, i) => i !== idx)
                     })}
                     className="text-red-500 hover:text-red-700 text-xs font-bold"
                   >
                     Remove
                   </button>
                 </div>
               ))}
             </div>
           )}
         </div>
       </div>
     )}
   </div>
 </ThemedModal>

 </div>
 );
};