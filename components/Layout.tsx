import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Bus, 
  Users, 
  GraduationCap, 
  Building2, 
  Settings, 
  Bell, 
  LogOut, 
  ChevronDown,
  ChevronLeft,
  Search,
  Check,
  Menu,
  MapPin,
  Truck
} from 'lucide-react';
import { User, UserRole, School, Notification, NotificationType } from '../types';
import { SCHOOLS } from '../services/mockData';

interface LayoutProps {
  currentUser: User;
  currentSchool: School | null;
  onSchoolChange: (schoolId: string) => void;
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
  notifications: Notification[];
}

export const Layout: React.FC<LayoutProps> = ({ 
  currentUser, 
  currentSchool, 
  onSchoolChange, 
  activePage, 
  onNavigate, 
  onLogout,
  children,
  notifications
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSchoolSelectorOpen, setIsSchoolSelectorOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-trigger') && !target.closest('.dropdown-content')) {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
        setIsSchoolSelectorOpen(false);
      }
      
      // Collapse search if clicked outside
      if (isSearchExpanded && target.closest('.search-container') === null) {
         if (!searchInputRef.current?.value) setIsSearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchExpanded]);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const getNavItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'routes', label: 'Routes', icon: MapPin },
      { id: 'operations', label: 'Operations', icon: Truck },
    ];

    // School admins don't see Schools page
    if (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.ADMIN) {
      baseItems.push({ id: 'schools', label: 'Schools', icon: Building2 });
    }

    baseItems.push({ id: 'settings', label: 'Settings', icon: Settings });
    return baseItems;
  };

  return (
    <div className="min-h-screen flex flex-col font-urbanist relative selection:bg-[#ff3600] selection:text-white">
      
      {/* 
        3-PILL NAVBAR 
        Fixed top, full width, transparent container.
        Items are islands.
      */}
      <header className="fixed top-0 left-0 right-0 h-24 z-50 px-8 flex items-center justify-between pointer-events-none">
         
         {/* 
            PILL 1: LEFT (Logo)
            Pointer events auto to allow interaction within the floating container
         */}
         <div className="pointer-events-auto bg-white rounded-full shadow-float px-6 py-3 flex items-center gap-4 transition-transform hover:scale-[1.02]">
             <div className="w-8 h-8 bg-[#ff3600] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">BB</div>
             <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wide text-brand-black">Bus Buddy</span>
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest leading-none mt-0.5">Platform</span>
             </div>
         </div>

         {/* 
            PILL 2: CENTER (Search, User, School) 
            The "Mid-nav pill"
         */}
         <div className="pointer-events-auto bg-white rounded-full shadow-float p-1.5 flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
              
              {/* Expandable Search Circle */}
              <div className={`
                  search-container flex items-center bg-gray-50 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${isSearchExpanded ? 'w-80 px-4' : 'w-10 h-10 justify-center cursor-pointer hover:bg-gray-100'}
              `}>
                <button 
                  onClick={() => setIsSearchExpanded(true)}
                  className="text-gray-400 hover:text-brand-black flex-shrink-0"
                >
                  <Search size={18} strokeWidth={2} />
                </button>
                
                {isSearchExpanded && (
                  <input 
                    ref={searchInputRef}
                    type="text" 
                    placeholder="Search ecosystem..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-brand-black ml-2 h-full placeholder:text-gray-400 w-full"
                  />
                )}
              </div>

              {/* Separator */}
              <div className="w-px h-6 bg-gray-100 mx-1"></div>

              {/* Hello User */}
              <div className="px-2 hidden lg:block">
                 <p className="text-sm font-medium text-gray-500">Hello, <span className="text-brand-black font-bold">{currentUser.name.split(' ')[0]}</span></p>
              </div>

              {/* School Selector Dropdown */}
              {currentUser.role !== UserRole.SCHOOL_ADMIN && (
                <div className="relative dropdown-trigger">
                  <button 
                    onClick={() => setIsSchoolSelectorOpen(!isSchoolSelectorOpen)}
                    className="h-10 px-5 bg-white text-brand-black rounded-full text-xs font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm border border-gray-100"
                  >
                    <span className="truncate max-w-[120px]">{currentSchool?.name || "All Schools"}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                  
                  {isSchoolSelectorOpen && (
                    <div className="dropdown-content absolute top-full right-0 mt-3 w-60 bg-white rounded-[1.5rem] shadow-float border border-gray-100 p-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <button
                          onClick={() => { onSchoolChange(''); setIsSchoolSelectorOpen(false); }}
                          className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl flex items-center justify-between transition-colors ${
                            !currentSchool ? 'bg-gray-50 text-brand-black' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          All Schools
                          {!currentSchool && <Check size={14} className="text-brand-green"/>}
                        </button>
                        <div className="h-px bg-gray-50 my-1"></div>
                        {SCHOOLS.map(school => (
                          <button
                            key={school.id}
                            onClick={() => { onSchoolChange(school.id); setIsSchoolSelectorOpen(false); }}
                            className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl flex items-center justify-between transition-colors mb-0.5 ${
                              currentSchool?.id === school.id ? 'bg-gray-50 text-brand-black' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {school.name}
                            {currentSchool?.id === school.id && <Check size={14} className="text-brand-green" />}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
         </div>

         {/* 
            PILL 3: RIGHT (Notifications & Profile) 
         */}
         <div className="pointer-events-auto flex items-center gap-3">
              
              {/* Notification Circle */}
              <div className="relative dropdown-trigger">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="w-12 h-12 bg-white rounded-full shadow-float flex items-center justify-center text-gray-400 hover:text-brand-black hover:scale-105 transition-all relative"
                >
                  <Bell size={20} strokeWidth={2} />
                  {unreadCount > 0 && <span className="absolute top-3 right-3 w-2 h-2 bg-brand-orange rounded-full ring-2 ring-white"></span>}
                </button>
                
                {isNotificationsOpen && (
                    <div className="dropdown-content absolute right-0 top-full mt-4 w-80 bg-white rounded-[2rem] shadow-float border border-white/50 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-5 pb-2 flex justify-between items-center">
                        <h3 className="font-bold text-sm text-brand-black">Activity</h3>
                        <button className="text-[10px] font-bold tracking-wider text-gray-400 hover:text-brand-black uppercase">Clear</button>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto p-2">
                        {notifications.map(note => (
                          <div key={note.id} className="p-3 rounded-2xl hover:bg-gray-50 transition-colors flex gap-4 cursor-pointer group">
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                              note.type === NotificationType.SAFETY ? 'bg-brand-orange/10 text-brand-orange' : 
                              note.type === NotificationType.DELAY ? 'bg-brand-amber/10 text-brand-amber' : 'bg-gray-100 text-gray-400'
                            }`}>
                              <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{note.type}</p>
                                <p className="text-sm font-medium text-brand-black leading-snug">{note.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                )}
              </div>

              {/* Profile Pill */}
              <div className="relative dropdown-trigger">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)} 
                  className="flex items-center gap-3 pl-1 pr-4 py-1 bg-white rounded-full shadow-float hover:scale-[1.02] transition-all"
                >
                   <img src={currentUser.avatarUrl} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                   <div className="flex flex-col items-start mr-2">
                      <span className="text-xs font-bold text-brand-black leading-none">{currentUser.role === UserRole.SUPER_ADMIN ? 'Super Admin' : 'Admin'}</span>
                   </div>
                   <ChevronDown size={14} className="text-gray-300" />
                </button>
                
                {isProfileOpen && (
                   <div className="dropdown-content absolute top-full right-0 mt-4 w-64 bg-white rounded-[2rem] shadow-float border border-white/50 z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-5 py-4 border-b border-gray-50 mb-1 text-center">
                         <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-2 overflow-hidden">
                            <img src={currentUser.avatarUrl} className="w-full h-full object-cover" />
                         </div>
                         <p className="text-sm font-bold text-brand-black">{currentUser.name}</p>
                         <p className="text-[10px] text-gray-400">{currentUser.email}</p>
                      </div>
                      <div className="p-1 space-y-1">
                        <button className="w-full text-left px-4 py-3 text-xs font-bold text-gray-500 hover:text-brand-black hover:bg-gray-50 rounded-xl flex items-center transition-all">
                            <Settings size={14} className="mr-3" /> Preferences
                        </button>
                        <button 
                            onClick={onLogout}
                            className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl flex items-center transition-all"
                        >
                            <LogOut size={14} className="mr-3" /> Log Out
                        </button>
                      </div>
                   </div>
                )}
              </div>
         </div>
      </header>

      {/* 
        FLOATING CENTERED SIDEBAR 
        Fixed position, vertically centered, height approx 50-60vh.
        Aligns left with the Logo Pill (left-8).
      */}
      <aside 
        className={`
          fixed left-8 top-1/2 -translate-y-1/2 z-40
          bg-white shadow-float rounded-[2rem]
          transition-[width] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
          flex flex-col py-6
          ${isSidebarCollapsed ? 'w-20' : 'w-64'}
          max-h-[600px] h-[60vh]
        `}
      >
        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-2 overflow-y-auto scrollbar-hide flex flex-col justify-center">
          {getNavItems().map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  flex items-center relative group
                  transition-all duration-300
                  ${isSidebarCollapsed 
                    ? 'justify-center w-12 h-12 mx-auto rounded-full' 
                    : 'w-full px-5 py-3.5 rounded-full'}
                  ${isActive 
                    ? 'bg-[#ff3600] text-white shadow-lg shadow-[#ff3600]/20' 
                    : 'text-gray-400 hover:bg-[#ff3600]/5 hover:text-brand-black'}
                `}
              >
                <div className="flex-shrink-0 flex items-center justify-center">
                   <Icon 
                    size={20} 
                    strokeWidth={isActive ? 2 : 2}
                    className={`transition-transform duration-300 ${!isSidebarCollapsed && isActive ? 'scale-100' : ''}`} 
                  />
                </div>
                
                <span 
                  className={`
                    ml-4 text-sm font-bold whitespace-nowrap overflow-hidden transition-all duration-300
                    ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}
                  `}
                >
                  {item.label}
                </span>

                {/* Hover Dot for Collapsed State */}
                {isSidebarCollapsed && isActive && (
                    <div className="absolute -right-1 top-1 w-2 h-2 bg-brand-black rounded-full border border-white"></div>
                )}
                
                {/* Tooltip for collapsed */}
                {isSidebarCollapsed && (
                  <div className="absolute left-16 bg-brand-black text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50 whitespace-nowrap translate-x-2 group-hover:translate-x-0 duration-200">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Toggle */}
        <div className="px-3 mt-4 flex justify-center">
           <button 
             onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
             className={`
                bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-brand-black rounded-full transition-all
                ${isSidebarCollapsed ? 'p-3' : 'w-full py-3 flex items-center justify-center gap-2'}
             `}
           >
             {isSidebarCollapsed ? <Menu size={18} /> : <><ChevronLeft size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Collapse</span></>}
           </button>
        </div>
      </aside>

      {/* 
        MAIN CONTENT 
        Offset to account for the floating sidebar width space (even though sidebar is floating, we reserve margin).
        Pt-32 to clear the floating navbar.
      */}
      <main 
        className={`
            flex-1 pt-32 pb-10 pr-8
            transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
            ${isSidebarCollapsed ? 'pl-36' : 'pl-80'}
        `}
      >
           <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-160px)]">
               {children}
           </div>
      </main>
    </div>
  );
};