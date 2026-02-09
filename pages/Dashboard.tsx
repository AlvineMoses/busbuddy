import React, { useState } from 'react';
import { 
  Bus, 
  MapPin, 
  Clock, 
  Navigation,
  ArrowUpRight,
  Plus,
  Minus,
  X,
  User,
  Phone,
  FileText,
  Building2,
  Users,
  Activity,
  Zap,
  Gauge
} from 'lucide-react';
import { TransportRoute, User as UserType, UserRole } from '../types';

interface DashboardProps {
  routes: TransportRoute[];
  user: UserType;
  onNavigate: (page: string) => void;
}

// Sophisticated Widget Card
const WidgetCard = ({ label, value, subtext, icon: Icon, themeColor }: any) => {
  const colorMap: any = {
    'lilac': { bg: 'bg-[#bda8ff]', text: 'text-[#bda8ff]', light: 'bg-[#bda8ff]/10' },
    'green': { bg: 'bg-[#1fd701]', text: 'text-[#1fd701]', light: 'bg-[#1fd701]/10' },
    'amber': { bg: 'bg-[#ff9d00]', text: 'text-[#ff9d00]', light: 'bg-[#ff9d00]/10' },
    'orange': { bg: 'bg-[#FF6106]', text: 'text-[#FF6106]', light: 'bg-[#FF6106]/10' },
  };
  const theme = colorMap[themeColor] || colorMap['lilac'];
  
  return (
    <div className={`relative bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-soft-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden`}>
       {/* Background Decoration */}
       <div className={`absolute top-0 right-0 w-32 h-32 ${theme.light} rounded-full blur-3xl -mr-10 -mt-10 opacity-60 group-hover:opacity-100 transition-opacity`}></div>
       
       <div className="relative z-10 flex flex-col h-full justify-between gap-8">
          <div className="flex justify-between items-start">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme.bg} shadow-sm text-white`}>
                <Icon size={22} strokeWidth={2} />
             </div>
             <button className="w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors">
                <ArrowUpRight size={18} />
             </button>
          </div>
          
          <div>
             <h3 className="text-5xl font-medium text-brand-black tracking-tight mb-2">{value}</h3>
             <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold uppercase tracking-widest ${theme.text}`}>{label}</span>
                <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                <span className="text-xs text-gray-400 font-medium">{subtext}</span>
             </div>
          </div>
       </div>
    </div>
  );
};

const RouteMap = ({ routes, onNavigate }: { routes: TransportRoute[], onNavigate: (page: string) => void }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.8));

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPan({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="relative w-full h-full bg-white/60 backdrop-blur-md rounded-[3rem] overflow-hidden border border-white/60 shadow-soft-xl group z-0">
      
      {/* Map Layer */}
      <div 
        className="w-full h-full cursor-grab active:cursor-grabbing" 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => setSelectedRoute(null)}
      >
         <div 
            className="w-full h-full transition-transform duration-100 ease-linear" 
            style={{ 
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, 
                transformOrigin: 'center center' 
            }}
        >
            <svg className="w-full h-full pointer-events-none">
               <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                     <feGaussianBlur stdDeviation="3" result="blur" />
                     <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.5" />
                    <stop offset="50%" stopColor="#ff3600" stopOpacity="1" />
                    <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.5" />
                  </linearGradient>
               </defs>

               {/* Background Grid */}
               <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
               </pattern>
               <rect width="100%" height="100%" fill="url(#grid)" />

               {/* Abstract Routes */}
               <g className="pointer-events-auto">
                   {/* Route Path 1 */}
                   <path 
                        d="M150,250 C 350,150 550,450 850,250" 
                        stroke="#f1f5f9" 
                        strokeWidth="12" 
                        fill="none" 
                        strokeLinecap="round" 
                   />
                   <path 
                        d="M150,250 C 350,150 550,450 850,250" 
                        stroke="#ff3600" 
                        strokeWidth="4" 
                        fill="none" 
                        strokeLinecap="round" 
                        strokeDasharray="8 8"
                        className="animate-[dash_20s_linear_infinite]"
                   />
                   
                   {/* Bus Nodes */}
                   {routes.slice(0,3).map((route, i) => {
                       // Calculate pseudo-random positions along the path (simplified for mock)
                       const positions = [
                           { cx: 250, cy: 200 },
                           { cx: 550, cy: 300 },
                           { cx: 750, cy: 250 }
                       ];
                       const pos = positions[i] || { cx: 100, cy: 100 };

                       return (
                          <g 
                            key={route.id} 
                            className="cursor-pointer transition-transform duration-300 hover:scale-110"
                            onClick={(e) => { e.stopPropagation(); setSelectedRoute(route); }}
                          >
                             {/* Pulse Effect */}
                             <circle cx={pos.cx} cy={pos.cy} r="30" fill={route.health === 'NORMAL' ? '#1fd701' : '#ff9d00'} opacity="0.2" className="animate-ping" />
                             
                             {/* Node Body */}
                             <circle cx={pos.cx} cy={pos.cy} r="18" fill="white" filter="url(#glow)" />
                             <circle cx={pos.cx} cy={pos.cy} r="6" fill={route.health === 'NORMAL' ? '#1fd701' : '#ff9d00'} />
                             
                             {/* Selection Indicator */}
                             {selectedRoute?.id === route.id && (
                                <circle cx={pos.cx} cy={pos.cy} r="26" stroke="#0f172a" strokeWidth="1.5" fill="none" strokeDasharray="4 4" className="animate-spin-slow" />
                             )}

                             {/* Label */}
                             <foreignObject x={pos.cx - 60} y={pos.cy + 25} width="120" height="40">
                                <div className="text-center">
                                    <span className="bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded-full shadow-sm text-brand-black border border-white">
                                        {route.vehiclePlate}
                                    </span>
                                </div>
                             </foreignObject>
                          </g>
                       );
                   })}
               </g>
            </svg>
         </div>
      </div>

      {/* Map Controls - Z-index fixed */}
      <div className="absolute top-8 right-8 flex flex-col gap-3 z-10">
         <button onClick={handleZoomIn} className="w-12 h-12 bg-white rounded-2xl shadow-float text-gray-600 hover:text-brand-black hover:scale-105 transition-all flex items-center justify-center"><Plus size={20}/></button>
         <button onClick={handleZoomOut} className="w-12 h-12 bg-white rounded-2xl shadow-float text-gray-600 hover:text-brand-black hover:scale-105 transition-all flex items-center justify-center"><Minus size={20}/></button>
      </div>

      {/* Legend Pill */}
      <div className="absolute bottom-8 left-8 bg-white/80 backdrop-blur-xl px-2 py-2 rounded-full shadow-float border border-white flex gap-4 items-center z-10">
         <div className="flex items-center gap-2 px-3"><div className="w-2 h-2 rounded-full bg-[#1fd701] shadow-[0_0_10px_#1fd701]"></div><span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Normal</span></div>
         <div className="flex items-center gap-2 px-3"><div className="w-2 h-2 rounded-full bg-[#ff9d00]"></div><span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Delay</span></div>
         <div className="flex items-center gap-2 px-3"><div className="w-2 h-2 rounded-full bg-[#FF6106]"></div><span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Alert</span></div>
      </div>

      {/* Side Panel Drawer */}
      <div className={`
          absolute top-4 bottom-4 right-4 w-96 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white z-20
          transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col overflow-hidden
          ${selectedRoute ? 'translate-x-0' : 'translate-x-[120%]'}
      `}>
          {selectedRoute && (
              <>
                <div className="p-8 pb-4 flex justify-between items-start bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
                   <div>
                       <h3 className="font-bold text-2xl text-brand-black">{selectedRoute.name}</h3>
                       <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${selectedRoute.health === 'NORMAL' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                             {selectedRoute.health}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">{selectedRoute.vehiclePlate}</span>
                       </div>
                   </div>
                   <button onClick={() => setSelectedRoute(null)} className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-100 transition-colors"><X size={16}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Driver Card */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-brand-black shadow-sm">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Driver</p>
                            <p className="font-bold text-brand-black">James Wilson</p>
                            <div className="flex gap-2 mt-1">
                               <button className="p-1.5 rounded-full bg-white text-gray-500 hover:text-brand-black shadow-sm transition-all"><Phone size={10} /></button>
                               <button className="p-1.5 rounded-full bg-white text-gray-500 hover:text-brand-black shadow-sm transition-all"><FileText size={10} /></button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-[#bda8ff]/5 border border-[#bda8ff]/20">
                            <Gauge size={20} className="text-brand-lilac mb-2" />
                            <p className="text-2xl font-bold text-brand-black">45 <span className="text-xs text-gray-400 font-medium">km/h</span></p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Speed</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#1fd701]/5 border border-[#1fd701]/20">
                            <Activity size={20} className="text-[#1fd701] mb-2" />
                            <p className="text-2xl font-bold text-brand-black">98%</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Efficiency</p>
                        </div>
                    </div>

                    {/* Timeline Preview */}
                    <div>
                        <h4 className="font-bold text-brand-black mb-4 flex items-center gap-2">
                            <Clock size={16} className="text-gray-400"/> Recent Events
                        </h4>
                        <div className="space-y-4 relative border-l border-gray-100 ml-2 pl-6">
                            {[
                                { time: '07:45 AM', text: 'Arrived at Stop 4' },
                                { time: '07:30 AM', text: 'Departed School' },
                                { time: '07:15 AM', text: 'Safety Check Complete' }
                            ].map((evt, i) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-brand-lilac"></div>
                                    <p className="text-sm font-bold text-brand-black">{evt.text}</p>
                                    <p className="text-xs text-gray-400 font-mono">{evt.time}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-50 bg-white">
                    <button 
                        onClick={() => onNavigate('routes')}
                        className="w-full py-4 bg-[#ff3600] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#ff3600]/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                        View Full Route Details <ArrowUpRight size={16} />
                    </button>
                </div>
              </>
          )}
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ routes, user, onNavigate }) => {
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
  
  // Mock Drivers
  const MOCK_LIVE_DRIVERS = [
    { id: 'D1', name: 'James Wilson', status: 'ON_TRIP', vehicle: 'BUS-101', avatar: 'https://picsum.photos/150' },
    { id: 'D2', name: 'Robert Chen', status: 'ONLINE', vehicle: 'BUS-102', avatar: 'https://picsum.photos/151' },
    { id: 'D3', name: 'Sarah Miller', status: 'OFFLINE', vehicle: '-', avatar: 'https://picsum.photos/152' },
    { id: 'D4', name: 'David Kim', status: 'ONLINE', vehicle: 'BUS-206', avatar: 'https://picsum.photos/153' },
    { id: 'D5', name: 'Lisa Ray', status: 'ON_TRIP', vehicle: 'BUS-207', avatar: 'https://picsum.photos/154' },
  ];

  const filteredDrivers = MOCK_LIVE_DRIVERS.filter(d => {
    if (driverSubTab === 'all') return true;
    if (driverSubTab === 'online') return d.status === 'ONLINE';
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
        <button onClick={handleExport} className="bg-[#ff3600] text-white px-8 py-4 rounded-full text-sm font-bold shadow-2xl hover:scale-105 transition-transform flex items-center gap-3">
          <span>Export Analytics</span>
          <ArrowUpRight size={18} />
        </button>
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
                <div className="p-2 bg-white rounded-full shadow-sm"><Activity size={20} className="text-[#ff3600]" /></div>
             </div>

             {/* Tab Toggle */}
             <div className="flex p-1.5 bg-gray-100/50 rounded-2xl mb-6">
               <button onClick={() => setFeedTab('fleet')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${feedTab === 'fleet' ? 'bg-[#ff3600] shadow-sm text-white' : 'text-gray-400 hover:text-gray-600'}`}>Fleet Status</button>
               <button onClick={() => setFeedTab('drivers')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${feedTab === 'drivers' ? 'bg-[#ff3600] shadow-sm text-white' : 'text-gray-400 hover:text-gray-600'}`}>Drivers</button>
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
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${driver.status === 'ONLINE' ? 'bg-green-50 text-green-600 border-green-100' : driver.status === 'ON_TRIP' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                         {driver.status.replace('_', ' ')}
                      </span>
                   </div>
                ))
             )}
          </div>
        </div>

        {/* Map Widget */}
        <div className="lg:col-span-2 h-full">
           <RouteMap routes={routes} onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
};