import React, { useState, useRef } from 'react';
import { Bell, Shield, Save, User, Check, AlertCircle, PieChart, Users, Bus, Map as MapIcon, Wallet, Layers, ToggleRight, Plus, Server, Code, Palette, Image as ImageIcon, MessageSquare, Monitor, Upload, CloudUpload } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  admin: boolean;
  schoolAdmin: boolean;
}

interface PermissionGroup {
  category: string;
  icon: any;
  permissions: Permission[];
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  avatar: string;
}

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  // Appearance State
  const [platformName, setPlatformName] = useState("Bus Buddy");
  
  // Color Scheme
  const [colors, setColors] = useState({
      primary: '#ff3600',
      secondary: '#1fd701',
      surface: '#f8fafc'
  });

  // Login Config
  const [loginHeroImage, setLoginHeroImage] = useState("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop");
  const [heroMode, setHeroMode] = useState<'url' | 'upload'>('url');
  
  // Logo Config
  const [logoMode, setLogoMode] = useState<'url' | 'upload'>('url');
  const [logoUrls, setLogoUrls] = useState({ light: '', dark: '' });

  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    { id: '1', name: 'Riaot Escanor', role: 'Project Manager at Google', text: 'I Landed Multiple Projects Within A Couple Of Days - With This Tool. Definitely My Go To Freelance Platform Now!', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop' }
  ]);

  // Comprehensive Permission Matrix
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([
    {
      category: "Transport Operations",
      icon: MapIcon,
      permissions: [
        { id: 'op_1', name: 'Route Management', description: 'Create, edit, and archive transport routes', admin: true, schoolAdmin: true },
        { id: 'op_2', name: 'Live Monitoring', description: 'Access real-time fleet tracking map', admin: true, schoolAdmin: true },
        { id: 'op_3', name: 'Trip Auditing', description: 'View and edit historical trip logs', admin: true, schoolAdmin: true },
        { id: 'op_4', name: 'Manual Override', description: 'Force complete/cancel active trips', admin: true, schoolAdmin: false },
      ]
    },
    {
      category: "Fleet & Staff",
      icon: Bus,
      permissions: [
        { id: 'fl_1', name: 'Driver Registry', description: 'Onboard and manage driver profiles', admin: true, schoolAdmin: true },
        { id: 'fl_2', name: 'Vehicle Assignment', description: 'Assign buses to routes/drivers', admin: true, schoolAdmin: true },
        { id: 'fl_3', name: 'Document Compliance', description: 'Verify licenses and insurance docs', admin: true, schoolAdmin: false },
      ]
    },
    {
      category: "Module Assignment",
      icon: Layers,
      permissions: [
        { id: 'mod_1', name: 'Finance Module', description: 'Access to billing and contracts', admin: false, schoolAdmin: false },
        { id: 'mod_2', name: 'Safety Center', description: 'Incident reporting and analysis dashboard', admin: true, schoolAdmin: true },
        { id: 'mod_3', name: 'Advanced Analytics', description: 'Business intelligence reports', admin: true, schoolAdmin: false },
      ]
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePermission = (groupIdx: number, permId: string, role: 'admin' | 'schoolAdmin') => {
    const newGroups = [...permissionGroups];
    const group = newGroups[groupIdx];
    const permIndex = group.permissions.findIndex(p => p.id === permId);
    
    if (permIndex !== -1) {
      group.permissions[permIndex][role] = !group.permissions[permIndex][role];
      setPermissionGroups(newGroups);
    }
  };

  const handleSave = () => {
    alert("Preferences saved successfully!");
  };

  const handleCreateRole = () => {
    alert("Role Creation Wizard would open here.");
  };

  const handleUploadSimulate = (label: string) => {
      // Simulate file dialog
      alert(`Opening file dialog for: ${label}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-medium text-brand-black tracking-tight">Settings</h1>
          <p className="text-gray-500 font-light mt-2 text-lg">Configure platform preferences and permissions.</p>
        </div>
        <button 
            onClick={handleSave}
            className="bg-brand-black hover:bg-gray-900 text-white px-8 py-3.5 rounded-full text-sm font-bold shadow-xl shadow-brand-black/20 transition-all flex items-center gap-2"
        >
          <Save size={18} strokeWidth={2} /> <span>Save Changes</span>
        </button>
      </div>

      <div className="flex p-1.5 bg-white rounded-full w-fit border border-gray-100 shadow-sm flex-wrap">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
            activeTab === 'general' ? 'bg-brand-lilac text-brand-black shadow-lg shadow-brand-lilac/20' : 'text-gray-400 hover:text-brand-black'
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
            activeTab === 'appearance' ? 'bg-brand-lilac text-brand-black shadow-lg shadow-brand-lilac/20' : 'text-gray-400 hover:text-brand-black'
          }`}
        >
          Appearance
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
            activeTab === 'roles' ? 'bg-brand-lilac text-brand-black shadow-lg shadow-brand-lilac/20' : 'text-gray-400 hover:text-brand-black'
          }`}
        >
          Roles & Permissions
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
            activeTab === 'system' ? 'bg-brand-lilac text-brand-black shadow-lg shadow-brand-lilac/20' : 'text-gray-400 hover:text-brand-black'
          }`}
        >
          System
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12 min-h-[600px]">
        {activeTab === 'general' && (
           <div className="max-w-3xl space-y-10 animate-in fade-in duration-500">
              
              <div className="space-y-6">
                 <h3 className="text-xl font-bold text-brand-black flex items-center gap-3">
                    <User className="text-brand-lilac" size={24}/> Profile Information
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                       <input type="text" defaultValue="Sarah Super" className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-brand-lilac/10 focus:border-brand-lilac transition-all" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                       <input type="email" defaultValue="sarah@platform.com" className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-brand-lilac/10 focus:border-brand-lilac transition-all" />
                    </div>
                 </div>
              </div>

              <div className="w-full h-px bg-gray-100"></div>

              <div className="space-y-6">
                 <h3 className="text-xl font-bold text-brand-black flex items-center gap-3">
                    <Bell className="text-brand-orange" size={24}/> Notifications
                 </h3>
                 <div className="space-y-4">
                    {['Email Alerts for Safety Incidents', 'SMS Notifications for Delays', 'Weekly Analytics Report'].map((item, idx) => (
                       <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                          <span className="font-bold text-brand-black text-sm">{item}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" className="sr-only peer" defaultChecked={idx === 0} />
                             <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
                          </label>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'appearance' && (
            <div className="max-w-4xl space-y-12 animate-in fade-in duration-500">
                
                {/* Branding Section */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-brand-black flex items-center gap-3">
                        <Palette className="text-brand-lilac" size={24}/> Branding & Theme
                    </h3>
                    <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Platform Name</label>
                            <input 
                                type="text" 
                                value={platformName}
                                onChange={(e) => setPlatformName(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-brand-lilac/10 focus:border-brand-lilac transition-all" 
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Color Scheme</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Primary */}
                                <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex items-center gap-4">
                                    <input 
                                        type="color" 
                                        value={colors.primary}
                                        onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                                        className="w-10 h-10 rounded-full cursor-pointer border-none p-0 overflow-hidden shadow-sm"
                                    />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Primary</p>
                                        <input 
                                            type="text" 
                                            value={colors.primary}
                                            onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                                            className="w-full bg-transparent text-sm font-bold text-brand-black outline-none uppercase mt-1"
                                        />
                                    </div>
                                </div>
                                {/* Secondary */}
                                <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex items-center gap-4">
                                    <input 
                                        type="color" 
                                        value={colors.secondary}
                                        onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                                        className="w-10 h-10 rounded-full cursor-pointer border-none p-0 overflow-hidden shadow-sm"
                                    />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Secondary</p>
                                        <input 
                                            type="text" 
                                            value={colors.secondary}
                                            onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                                            className="w-full bg-transparent text-sm font-bold text-brand-black outline-none uppercase mt-1"
                                        />
                                    </div>
                                </div>
                                {/* Surface/Accent */}
                                <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex items-center gap-4">
                                    <input 
                                        type="color" 
                                        value={colors.surface}
                                        onChange={(e) => setColors({ ...colors, surface: e.target.value })}
                                        className="w-10 h-10 rounded-full cursor-pointer border-none p-0 overflow-hidden shadow-sm"
                                    />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Surface/BG</p>
                                        <input 
                                            type="text" 
                                            value={colors.surface}
                                            onChange={(e) => setColors({ ...colors, surface: e.target.value })}
                                            className="w-full bg-transparent text-sm font-bold text-brand-black outline-none uppercase mt-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Logo Section */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Platform Logo</label>
                                <div className="flex bg-gray-100 rounded-full p-1">
                                    <button 
                                        onClick={() => setLogoMode('url')}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${logoMode === 'url' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500'}`}
                                    >
                                        URL
                                    </button>
                                    <button 
                                        onClick={() => setLogoMode('upload')}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${logoMode === 'upload' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500'}`}
                                    >
                                        Upload
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Light Mode Logo */}
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Light Mode Logo</span>
                                    {logoMode === 'url' ? (
                                        <input 
                                            type="text" 
                                            placeholder="https://... (Light)"
                                            value={logoUrls.light}
                                            onChange={(e) => setLogoUrls({ ...logoUrls, light: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-brand-lilac/10 focus:border-brand-lilac transition-all" 
                                        />
                                    ) : (
                                        <button 
                                            onClick={() => handleUploadSimulate('Light Mode Logo')}
                                            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand-lilac hover:text-brand-lilac hover:bg-brand-lilac/5 transition-all"
                                        >
                                            <CloudUpload size={24} />
                                            <span className="text-xs font-bold">Upload Light Logo</span>
                                        </button>
                                    )}
                                </div>
                                {/* Dark Mode Logo */}
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Dark Mode Logo</span>
                                    {logoMode === 'url' ? (
                                        <input 
                                            type="text" 
                                            placeholder="https://... (Dark)"
                                            value={logoUrls.dark}
                                            onChange={(e) => setLogoUrls({ ...logoUrls, dark: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-brand-lilac/10 focus:border-brand-lilac transition-all" 
                                        />
                                    ) : (
                                        <button 
                                            onClick={() => handleUploadSimulate('Dark Mode Logo')}
                                            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand-black hover:text-brand-black hover:bg-gray-50 transition-all bg-gray-50"
                                        >
                                            <CloudUpload size={24} />
                                            <span className="text-xs font-bold">Upload Dark Logo</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-gray-100"></div>

                {/* Login Image Section */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-brand-black flex items-center gap-3">
                        <ImageIcon className="text-brand-orange" size={24}/> Login Experience
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Hero Image</label>
                                <div className="flex bg-gray-100 rounded-full p-1">
                                    <button 
                                        onClick={() => setHeroMode('url')}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${heroMode === 'url' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500'}`}
                                    >
                                        URL
                                    </button>
                                    <button 
                                        onClick={() => setHeroMode('upload')}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${heroMode === 'upload' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500'}`}
                                    >
                                        Upload
                                    </button>
                                </div>
                            </div>
                            
                            {heroMode === 'url' ? (
                                <input 
                                    type="text" 
                                    value={loginHeroImage}
                                    onChange={(e) => setLoginHeroImage(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-brand-lilac/10 focus:border-brand-lilac transition-all" 
                                />
                            ) : (
                                <button 
                                    onClick={() => handleUploadSimulate('Login Hero Image')}
                                    className="w-full py-8 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand-orange hover:text-brand-orange hover:bg-brand-orange/5 transition-all"
                                >
                                    <CloudUpload size={32} />
                                    <span className="text-sm font-bold">Click to Upload Hero Image</span>
                                </button>
                            )}

                            <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-500 leading-relaxed">
                                Tip: Use high-resolution images (at least 1920x1080) for the best result on large screens.
                            </div>
                        </div>
                        <div className="aspect-video rounded-[2rem] overflow-hidden border border-gray-200 shadow-md relative group">
                            {heroMode === 'url' && loginHeroImage ? (
                                <img src={loginHeroImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Login Preview" />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">Preview Area</div>
                            )}
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] px-3 py-1 rounded-full font-bold">Preview</div>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-gray-100"></div>

                {/* Testimonials Section */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-brand-black flex items-center gap-3">
                        <MessageSquare className="text-brand-green" size={24}/> Testimonials
                    </h3>
                    
                    {testimonials.map((t, idx) => (
                        <div key={t.id} className="p-6 rounded-[2rem] bg-gray-50 border border-gray-200 space-y-4 relative">
                            <div className="absolute top-4 right-4 text-gray-300 font-bold text-6xl opacity-20 select-none">“</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Person Name</label>
                                    <input type="text" defaultValue={t.name} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Role / Title</label>
                                    <input type="text" defaultValue={t.role} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Quote Text</label>
                                <textarea rows={3} defaultValue={t.text} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium resize-none" />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                                    <img src={t.avatar} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Avatar URL</label>
                                    <input type="text" defaultValue={t.avatar} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-mono text-gray-500" />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-[2rem] text-gray-400 font-bold text-sm hover:border-brand-black hover:text-brand-black transition-all flex items-center justify-center gap-2">
                        <Plus size={18} /> Add New Testimonial
                    </button>
                </div>

            </div>
        )}

        {activeTab === 'roles' && (
           <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 pb-8">
                 <div>
                   <h3 className="text-xl font-bold text-brand-black flex items-center gap-3">
                      <Shield className="text-brand-lilac" size={24}/> Access Control Matrix
                   </h3>
                   <p className="text-gray-500 mt-2 text-sm">Define capabilities and module access for standard admin roles.</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <button 
                        onClick={handleCreateRole}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-bold transition-colors text-brand-black"
                    >
                       <Plus size={14} /> Create New Role
                    </button>
                    <div className="flex items-center gap-6 text-sm bg-gray-50 px-6 py-3 rounded-full">
                       <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-black shadow-sm"></span> <span className="font-bold text-brand-black">Admin (Ops)</span></div>
                       <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-lilac shadow-sm"></span> <span className="font-bold text-brand-black">School Admin</span></div>
                    </div>
                 </div>
              </div>

              <div className="grid gap-12">
                {permissionGroups.map((group, groupIdx) => (
                  <div key={group.category} className="space-y-4">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                          <group.icon size={16} />
                        </div>
                        <h4 className="text-lg font-bold text-brand-black uppercase tracking-wide">{group.category}</h4>
                     </div>
                     
                     <div className="overflow-hidden rounded-[2rem] border border-gray-100 shadow-sm bg-white">
                        <table className="w-full text-left">
                           <thead className="bg-gray-50/50 text-gray-400 font-bold text-xs uppercase tracking-widest">
                              <tr>
                                 <th className="px-8 py-4 w-1/2">Permission Node</th>
                                 <th className="px-8 py-4 text-center w-1/4">Admin</th>
                                 <th className="px-8 py-4 text-center w-1/4">School Admin</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                              {group.permissions.map((perm) => (
                                 <tr key={perm.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                       <p className="font-bold text-brand-black text-sm">{perm.name}</p>
                                       <p className="text-xs font-medium text-gray-400 mt-1">{perm.description}</p>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                       <button 
                                         onClick={() => togglePermission(groupIdx, perm.id, 'admin')}
                                         className={`w-12 h-7 rounded-full relative transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-black/20 ${perm.admin ? 'bg-brand-black' : 'bg-gray-200'}`}
                                       >
                                          <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm flex items-center justify-center ${perm.admin ? 'translate-x-5' : 'translate-x-0'}`}>
                                            {perm.admin && <Check size={10} className="text-brand-black" />}
                                          </span>
                                       </button>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                       <button 
                                         onClick={() => togglePermission(groupIdx, perm.id, 'schoolAdmin')}
                                         className={`w-12 h-7 rounded-full relative transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-lilac/20 ${perm.schoolAdmin ? 'bg-brand-lilac' : 'bg-gray-200'}`}
                                       >
                                          <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm flex items-center justify-center ${perm.schoolAdmin ? 'translate-x-5' : 'translate-x-0'}`}>
                                             {perm.schoolAdmin && <Check size={10} className="text-brand-lilac" />}
                                          </span>
                                       </button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
                ))}
              </div>
           </div>
        )}

        {activeTab === 'system' && (
           <div className="max-w-3xl space-y-10 animate-in fade-in duration-500">
              
              <div className="space-y-6">
                 <h3 className="text-xl font-bold text-brand-black flex items-center gap-3">
                    <Server className="text-blue-500" size={24}/> Feature Flags
                 </h3>
                 <p className="text-gray-500 text-sm">Experimental features and white-label configurations.</p>
                 
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-6 rounded-[2rem] bg-gray-50 border border-gray-100">
                       <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm">
                             <Code size={20} />
                          </div>
                          <div>
                             <h4 className="font-bold text-brand-black">White Labelling</h4>
                             <p className="text-xs text-gray-500 mt-1 max-w-sm">Remove 'SchoolTransact' branding and use custom domain/logos for tenant portals.</p>
                          </div>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-black"></div>
                       </label>
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-[2rem] bg-gray-50 border border-gray-100">
                       <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm">
                             <Wallet size={20} />
                          </div>
                          <div>
                             <h4 className="font-bold text-brand-black">Beta Payment Gateway</h4>
                             <p className="text-xs text-gray-500 mt-1 max-w-sm">Enable Stripe Connect integration for automated parent billing.</p>
                          </div>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-black"></div>
                       </label>
                    </div>
                 </div>
              </div>

           </div>
        )}
      </div>
    </div>
  );
};