import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedButton } from '../src/components/ThemedComponents';
import { Bell, Shield, Save, User, Check, PieChart, Users, Bus, Map as MapIcon, Wallet, Layers, Plus, Server, Code, Palette, Image as ImageIcon, MessageSquare, CloudUpload, RotateCcw, X, Info, FlaskConical, Globe, ChevronDown, Trash2 } from 'lucide-react';
import { EndpointsSettingsTab } from './EndpointsSettingsTab';
import useAppStore from '../src/store/AppStore';
import { UserRole } from '../types';
import { SCHOOLS } from '../services/mockData';
import { 
  fetchSettings, 
  updateSettings, 
  uploadImage,
  setPlatformName,
  setColors,
  setLoginHeroImage,
  setHeroMode,
  setLogoMode,
  setLogoUrls,
  addTestimonial,
  updateTestimonial,
  togglePermission,
  setPermissionGroups,
  setFeatureFlag,
  setOperatingDays,
  resetLogo,
  resetHeroImage,
  setProfileName,
  setProfileEmail,
  setNotificationPref,
  setWhiteLabelSchools,
  addCustomRole,
  deleteCustomRole,
} from '../src/store/slices/settingsSlice';
import type { CustomRole } from '../src/store/slices/settingsSlice';
import { addToast } from '../src/store/slices/uiSlice';
import { getUploadedFileUrl, formatFileSize, getUploadedFileMetadata } from '../src/services/fileUploadService';

interface Permission {
  id: string;
  name: string;
  description: string;
  admin: boolean;
  schoolAdmin: boolean;
}

interface PermissionGroup {
  category: string;
  iconName: string; // Store icon name as string, not component
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
  const dispatch = useDispatch<any>();
  const settings = useSelector((state: any) => state.settings);
  const currentUser = useAppStore((state: any) => state.auth.user);
  const setUser = useAppStore((state: any) => state.setUser);
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const [activeTab, setActiveTab] = useState('general');

  // Create Role modal
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleType, setNewRoleType] = useState<'admin' | 'school_admin' | 'custom'>('custom');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // White label school selector
  const [showSchoolSelector, setShowSchoolSelector] = useState(false);

  // Initialize profile fields from currentUser when they're empty
  useEffect(() => {
    if (currentUser && !settings.profileName) {
      dispatch(setProfileName(currentUser.name));
    }
    if (currentUser && !settings.profileEmail) {
      dispatch(setProfileEmail(currentUser.email));
    }
  }, [currentUser, dispatch, settings.profileName, settings.profileEmail]);

  // Icon mapper: string name -> React component
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      MapIcon,
      Bus,
      Layers,
      Shield,
      Users,
      PieChart,
      Wallet,
      Server,
      Code,
    };
    return iconMap[iconName] || Shield;
  };

  // Local refs
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const logoLightFileInputRef = useRef<HTMLInputElement>(null);
  const logoDarkFileInputRef = useRef<HTMLInputElement>(null);
  const logoPlatformFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch settings on mount
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Initialize permission groups if empty
  useEffect(() => {
    if (settings.permissionGroups.length === 0) {
      dispatch(setPermissionGroups([
        {
          category: "Transport Operations",
          iconName: "MapIcon",
          permissions: [
            { id: 'op_1', name: 'Route Management', description: 'Create, edit, and archive transport routes', admin: true, schoolAdmin: true },
            { id: 'op_2', name: 'Live Monitoring', description: 'Access real-time fleet tracking map', admin: true, schoolAdmin: true },
            { id: 'op_3', name: 'Trip Auditing', description: 'View and edit historical trip logs', admin: true, schoolAdmin: true },
            { id: 'op_4', name: 'Manual Override', description: 'Force complete/cancel active trips', admin: true, schoolAdmin: false },
          ]
        },
        {
          category: "Fleet & Staff",
          iconName: "Bus",
          permissions: [
            { id: 'fl_1', name: 'Driver Registry', description: 'Onboard and manage driver profiles', admin: true, schoolAdmin: true },
            { id: 'fl_2', name: 'Vehicle Assignment', description: 'Assign buses to routes/drivers', admin: true, schoolAdmin: true },
            { id: 'fl_3', name: 'Document Compliance', description: 'Verify licenses and insurance docs', admin: true, schoolAdmin: false },
          ]
        },
        {
          category: "Module Assignment",
          iconName: "Layers",
          permissions: [
            { id: 'mod_1', name: 'Finance Module', description: 'Access to billing and contracts', admin: false, schoolAdmin: false },
            { id: 'mod_2', name: 'Safety Center', description: 'Incident reporting and analysis dashboard', admin: true, schoolAdmin: true },
            { id: 'mod_3', name: 'Advanced Analytics', description: 'Business intelligence reports', admin: true, schoolAdmin: false },
            { id: 'mod_4', name: 'Social Sign-in', description: 'Allow users to sign in via Google/social identity providers', admin: false, schoolAdmin: false },
          ]
        }
      ]));
    }
  }, [dispatch, settings.permissionGroups.length]);

  const handlePermissionToggle = (groupIdx: number, permId: string, role: 'admin' | 'schoolAdmin') => {
    dispatch(togglePermission({ groupIdx, permId, role }));
  };

  const handleSave = async () => {
    try {
      const dataToSave = {
        platformName: settings.platformName,
        colors: settings.colors,
        loginHeroImage: settings.loginHeroImage,
        heroMode: settings.heroMode,
        uploadedHeroImage: settings.uploadedHeroImage,
        logoMode: settings.logoMode,
        logoUrls: settings.logoUrls,
        uploadedLogos: settings.uploadedLogos,
        testimonials: settings.testimonials,
        permissionGroups: settings.permissionGroups,
        featureFlags: settings.featureFlags,
        operatingDays: settings.operatingDays,
        profileName: settings.profileName,
        profileEmail: settings.profileEmail,
        notificationPrefs: settings.notificationPrefs,
        whiteLabelSchools: settings.whiteLabelSchools,
        customRoles: settings.customRoles,
      };
      
      // @ts-ignore - async thunk from JS file
      await (dispatch as any)(updateSettings(dataToSave)).unwrap();

      // Sync profile changes back to the Zustand auth user
      if (currentUser && (settings.profileName !== currentUser.name || settings.profileEmail !== currentUser.email)) {
        setUser({
          ...currentUser,
          name: settings.profileName || currentUser.name,
          email: settings.profileEmail || currentUser.email,
        });
      }
      
      dispatch(addToast({
        message: 'Settings saved successfully!',
        type: 'success',
        duration: 5000
      }));
    } catch (error) {
      console.error('❌ Settings Save - Failed:', error);
      dispatch(addToast({
        message: `Failed to save settings: ${error}`,
        type: 'error',
        duration: 5000
      }));
    }
  };

  const handleCreateRole = () => {
    setNewRoleName('');
    setNewRoleType('custom');
    setNewRoleDesc('');
    setShowCreateRole(true);
  };

  const handleSaveNewRole = () => {
    if (!newRoleName.trim()) {
      dispatch(addToast({ message: 'Role name is required.', type: 'error', duration: 3000 }));
      return;
    }
    const role: CustomRole = {
      id: `role_${Date.now()}`,
      name: newRoleName.trim(),
      type: newRoleType,
      description: newRoleDesc.trim(),
      permissions: {},
      createdAt: new Date().toISOString(),
    };
    dispatch(addCustomRole(role));
    setShowCreateRole(false);
    dispatch(addToast({ message: `Role "${role.name}" created successfully!`, type: 'success', duration: 3000 }));
  };

  const handleDeleteRole = (roleId: string, roleName: string) => {
    dispatch(deleteCustomRole(roleId));
    dispatch(addToast({ message: `Role "${roleName}" deleted.`, type: 'success', duration: 3000 }));
  };

  // Hero Image Upload
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      dispatch(addToast({
        message: 'Please select a valid image file',
        type: 'error',
        duration: 5000
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      dispatch(addToast({
        message: 'Image size must be less than 5MB',
        type: 'error',
        duration: 5000
      }));
      return;
    }

    try {
      // @ts-ignore - async thunk from JS file
      await (dispatch as any)(uploadImage({ file, type: 'hero' })).unwrap();
      dispatch(addToast({
        message: `Hero image "${file.name}" uploaded successfully!`,
        type: 'success',
        duration: 5000
      }));
    } catch (error) {
      dispatch(addToast({
        message: `Failed to upload image: ${error}`,
        type: 'error',
        duration: 5000
      }));
    }

    e.target.value = '';
  };

  // Logo Upload Handlers
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'light' | 'dark' | 'platform') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      dispatch(addToast({
        message: 'Please select a valid image file',
        type: 'error',
        duration: 5000
      }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      dispatch(addToast({
        message: 'Logo size must be less than 2MB',
        type: 'error',
        duration: 5000
      }));
      return;
    }

    try {
      // @ts-ignore - async thunk from JS file
      await (dispatch as any)(uploadImage({ file, type: `logo-${mode}` })).unwrap();
      dispatch(addToast({
        message: `${mode === 'platform' ? 'Platform' : mode === 'light' ? 'Light' : 'Dark'} mode logo uploaded successfully!`,
        type: 'success',
        duration: 5000
      }));
    } catch (error) {

      dispatch(addToast({
        message: `Failed to upload logo: ${error}`,
        type: 'error',
        duration: 5000
      }));
    }

    e.target.value = '';
  };

  // ============================================
  // RESET HANDLERS
  // ============================================

  const handleResetLogo = (mode: 'light' | 'dark' | 'platform') => {
    dispatch(resetLogo(mode));
    dispatch(addToast({
      message: `${mode === 'platform' ? 'Navigation' : mode === 'light' ? 'Light mode' : 'Dark mode'} logo reset to default.`,
      type: 'success',
      duration: 3000
    }));
  };

  const handleResetHero = () => {
    dispatch(resetHeroImage());
    dispatch(addToast({
      message: 'Hero image reset to default.',
      type: 'success',
      duration: 3000
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hidden file inputs – accept only PNG, JPG, JPEG, SVG */}
      <input 
        type="file" 
        ref={heroFileInputRef} 
        onChange={handleHeroImageUpload} 
        accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml" 
        className="hidden" 
        data-testid="hero-file-input"
      />
      <input 
        type="file" 
        ref={logoLightFileInputRef} 
        onChange={(e) => handleLogoUpload(e, 'light')} 
        accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml" 
        className="hidden" 
        data-testid="logo-light-file-input"
      />
      <input 
        type="file" 
        ref={logoDarkFileInputRef} 
        onChange={(e) => handleLogoUpload(e, 'dark')} 
        accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml" 
        className="hidden" 
        data-testid="logo-dark-file-input"
      />
      <input 
        type="file" 
        ref={logoPlatformFileInputRef} 
        onChange={(e) => handleLogoUpload(e, 'platform')} 
        accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml" 
        className="hidden" 
        data-testid="logo-platform-file-input"
      />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-5xl font-medium text-brand-black tracking-tight mb-2">Settings</h1>
          <p className="text-gray-500 font-normal text-xl">Configure platform preferences and permissions.</p>
        </div>
        <ThemedButton 
            variant="primary"
            onClick={handleSave}
            disabled={settings.loading}
            icon={Save}
        >
          {settings.loading ? 'Saving...' : 'Save Changes'}
        </ThemedButton>
      </div>

      <div className="flex p-1.5 bg-white rounded-full w-fit border border-gray-100 shadow-sm flex-wrap">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
            activeTab === 'general' ? 'text-white shadow-lg' : 'text-gray-400 hover:text-brand-black'
          }`}
          style={activeTab === 'general' ? { backgroundColor: settings.colors.primary } : undefined}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
            activeTab === 'appearance' ? 'text-white shadow-lg' : 'text-gray-400 hover:text-brand-black'
          }`}
          style={activeTab === 'appearance' ? { backgroundColor: settings.colors.primary } : undefined}
        >
          Appearance
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
            activeTab === 'roles' ? 'text-white shadow-lg' : 'text-gray-400 hover:text-brand-black'
          }`}
          style={activeTab === 'roles' ? { backgroundColor: settings.colors.primary } : undefined}
        >
          Roles & Permissions
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
            activeTab === 'system' ? 'text-white shadow-lg' : 'text-gray-400 hover:text-brand-black'
          }`}
          style={activeTab === 'system' ? { backgroundColor: settings.colors.primary } : undefined}
        >
          System
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
              activeTab === 'endpoints' ? 'text-white shadow-lg' : 'text-gray-400 hover:text-brand-black'
            }`}
            style={activeTab === 'endpoints' ? { backgroundColor: settings.colors.primary } : undefined}
          >
            <span className="flex items-center gap-2"><Globe size={14} /> Endpoints</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-4xl shadow-sm border border-gray-100 p-8 md:p-12 min-h-150">
        {activeTab === 'general' && (
           <div className="max-w-3xl space-y-10 animate-in fade-in duration-500">
              
              <div className="space-y-6">
                 <h3 className="text-xl font-bold text-brand-black flex items-center gap-3">
                    <User className="text-brand-lilac" size={24}/> Profile Information
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                       <input 
                         type="text" 
                         value={settings.profileName || ''} 
                         onChange={(e) => dispatch(setProfileName(e.target.value))}
                         className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-brand-lilac/10 focus:border-brand-lilac transition-all" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                       <input 
                         type="email" 
                         value={settings.profileEmail || ''} 
                         onChange={(e) => dispatch(setProfileEmail(e.target.value))}
                         className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-brand-lilac/10 focus:border-brand-lilac transition-all" 
                       />
                    </div>
                 </div>
              </div>

              <div className="w-full h-px bg-gray-100"></div>

              <div className="space-y-6">
                 <h3 className="text-xl font-bold text-brand-black flex items-center gap-3">
                    <Bell className="text-brand-orange" size={24}/> Notifications
                 </h3>
                 <div className="space-y-4">
                    {['Email Alerts for Safety Incidents', 'SMS Notifications for Delays', 'Weekly Analytics Report'].map((item) => (
                       <div key={item} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                          <span className="font-bold text-brand-black text-sm">{item}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                             <input 
                               type="checkbox" 
                               className="sr-only peer" 
                               checked={settings.notificationPrefs?.[item] ?? false} 
                               onChange={(e) => dispatch(setNotificationPref({ key: item, value: e.target.checked }))}
                             />
                             <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
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
                                value={settings.platformName}
                                onChange={(e) => dispatch(setPlatformName(e.target.value))}
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
                                        value={settings.colors.primary}
                                        onChange={(e) => dispatch(setColors({ primary: e.target.value }))}
                                        className="w-10 h-10 rounded-full cursor-pointer border-none p-0 overflow-hidden shadow-sm"
                                    />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Primary</p>
                                        <input 
                                            type="text" 
                                            value={settings.colors.primary}
                                            onChange={(e) => dispatch(setColors({ primary: e.target.value }))}
                                            className="w-full bg-transparent text-sm font-bold text-brand-black outline-none uppercase mt-1"
                                        />
                                    </div>
                                </div>
                                {/* Secondary */}
                                <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex items-center gap-4">
                                    <input 
                                        type="color" 
                                        value={settings.colors.secondary}
                                        onChange={(e) => dispatch(setColors({ secondary: e.target.value }))}
                                        className="w-10 h-10 rounded-full cursor-pointer border-none p-0 overflow-hidden shadow-sm"
                                    />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Secondary</p>
                                        <input 
                                            type="text" 
                                            value={settings.colors.secondary}
                                            onChange={(e) => dispatch(setColors({ secondary: e.target.value }))}
                                            className="w-full bg-transparent text-sm font-bold text-brand-black outline-none uppercase mt-1"
                                        />
                                    </div>
                                </div>
                                {/* Surface/Accent */}
                                <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex items-center gap-4">
                                    <input 
                                        type="color" 
                                        value={settings.colors.surface}
                                        onChange={(e) => dispatch(setColors({ surface: e.target.value }))}
                                        className="w-10 h-10 rounded-full cursor-pointer border-none p-0 overflow-hidden shadow-sm"
                                    />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Surface/BG</p>
                                        <input 
                                            type="text" 
                                            value={settings.colors.surface}
                                            onChange={(e) => dispatch(setColors({ surface: e.target.value }))}
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
                                        onClick={() => dispatch(setLogoMode('url'))}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${settings.logoMode === 'url' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500'}`}
                                    >
                                        URL
                                    </button>
                                    <button 
                                        onClick={() => dispatch(setLogoMode('upload'))}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${settings.logoMode === 'upload' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500'}`}
                                    >
                                        Upload
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Platform Logo */}
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Platform Logo</span>
                                    {settings.logoMode === 'url' ? (
                                        <input 
                                            type="text" 
                                            placeholder="https://... (Platform)"
                                            value={settings.logoUrls.platform || ''}
                                            onChange={(e) => dispatch(setLogoUrls({ platform: e.target.value }))}
                                            className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-brand-lilac/10 focus:border-brand-lilac transition-all" 
                                        />
                                    ) : (
                                        <div className="space-y-2">
                                            <button 
                                                onClick={() => logoPlatformFileInputRef.current?.click()}
                                                disabled={settings.uploadProgress['logo-platform']}
                                                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand-lilac hover:text-brand-lilac hover:bg-brand-lilac/5 transition-all disabled:opacity-50 disabled:cursor-wait"
                                            >
                                                <CloudUpload size={24} />
                                                <span className="text-xs font-bold">
                                                    {settings.uploadProgress['logo-platform'] ? 'Uploading...' : 'Upload Platform Logo'}
                                                </span>
                                            </button>
                                            {settings.uploadedLogos.platform && (
                                                <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3" data-testid="platform-logo-preview">
                                                    <img src={getUploadedFileUrl(settings.uploadedLogos.platform) || undefined} alt="Platform logo preview" className="w-12 h-12 object-contain rounded" />
                                                    <div className="flex-1 min-w-0">
                                                      <p className="text-xs text-gray-700 font-medium truncate">{(getUploadedFileMetadata(settings.uploadedLogos.platform) as any)?.originalName || 'Uploaded'}</p>
                                                      <p className="text-[10px] text-gray-400">{formatFileSize((getUploadedFileMetadata(settings.uploadedLogos.platform) as any)?.optimizedSize || 0)}</p>
                                                    </div>
                                                    <button onClick={() => handleResetLogo('platform')} className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Remove logo" data-testid="reset-platform-logo">
                                                      <X size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {/* Light Mode Logo */}
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Light Mode Logo</span>
                                    {settings.logoMode === 'url' ? (
                                        <input 
                                            type="text" 
                                            placeholder="https://... (Light)"
                                            value={settings.logoUrls.light}
                                            onChange={(e) => dispatch(setLogoUrls({ light: e.target.value }))}
                                            className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-brand-lilac/10 focus:border-brand-lilac transition-all" 
                                        />
                                    ) : (
                                        <div className="space-y-2">
                                            <button 
                                                onClick={() => logoLightFileInputRef.current?.click()}
                                                disabled={settings.uploadProgress['logo-light']}
                                                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand-lilac hover:text-brand-lilac hover:bg-brand-lilac/5 transition-all disabled:opacity-50 disabled:cursor-wait"
                                            >
                                                <CloudUpload size={24} />
                                                <span className="text-xs font-bold">
                                                    {settings.uploadProgress['logo-light'] ? 'Uploading...' : 'Upload Light Logo'}
                                                </span>
                                            </button>
                                            {settings.uploadedLogos.light && (
                                                <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3" data-testid="light-logo-preview">
                                                    <img src={getUploadedFileUrl(settings.uploadedLogos.light) || undefined} alt="Light logo preview" className="w-12 h-12 object-contain rounded" />
                                                    <div className="flex-1 min-w-0">
                                                      <p className="text-xs text-gray-700 font-medium truncate">{(getUploadedFileMetadata(settings.uploadedLogos.light) as any)?.originalName || 'Uploaded'}</p>
                                                      <p className="text-[10px] text-gray-400">{formatFileSize((getUploadedFileMetadata(settings.uploadedLogos.light) as any)?.optimizedSize || 0)}</p>
                                                    </div>
                                                    <button onClick={() => handleResetLogo('light')} className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Remove logo" data-testid="reset-light-logo">
                                                      <X size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {/* Dark Mode Logo */}
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Dark Mode Logo</span>
                                    {settings.logoMode === 'url' ? (
                                        <input 
                                            type="text" 
                                            placeholder="https://... (Dark)"
                                            value={settings.logoUrls.dark}
                                            onChange={(e) => dispatch(setLogoUrls({ dark: e.target.value }))}
                                            className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-brand-lilac/10 focus:border-brand-lilac transition-all" 
                                        />
                                    ) : (
                                        <div className="space-y-2">
                                            <button 
                                                onClick={() => logoDarkFileInputRef.current?.click()}
                                                disabled={settings.uploadProgress['logo-dark']}
                                                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand-black hover:text-brand-black hover:bg-gray-50 transition-all bg-gray-50 disabled:opacity-50 disabled:cursor-wait"
                                            >
                                                <CloudUpload size={24} />
                                                <span className="text-xs font-bold">
                                                    {settings.uploadProgress['logo-dark'] ? 'Uploading...' : 'Upload Dark Logo'}
                                                </span>
                                            </button>
                                            {settings.uploadedLogos.dark && (
                                                <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3 border border-gray-200" data-testid="dark-logo-preview">
                                                    <img src={getUploadedFileUrl(settings.uploadedLogos.dark) || undefined} alt="Dark logo preview" className="w-12 h-12 object-contain rounded bg-gray-800" />
                                                    <div className="flex-1 min-w-0">
                                                      <p className="text-xs text-gray-700 font-medium truncate">{(getUploadedFileMetadata(settings.uploadedLogos.dark) as any)?.originalName || 'Uploaded'}</p>
                                                      <p className="text-[10px] text-gray-400">{formatFileSize((getUploadedFileMetadata(settings.uploadedLogos.dark) as any)?.optimizedSize || 0)}</p>
                                                    </div>
                                                    <button onClick={() => handleResetLogo('dark')} className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Remove logo" data-testid="reset-dark-logo">
                                                      <X size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
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
                                        onClick={() => dispatch(setHeroMode('url'))}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${settings.heroMode === 'url' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500'}`}
                                    >
                                        URL
                                    </button>
                                    <button 
                                        onClick={() => dispatch(setHeroMode('upload'))}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${settings.heroMode === 'upload' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500'}`}
                                    >
                                        Upload
                                    </button>
                                </div>
                            </div>
                            
                            {settings.heroMode === 'url' ? (
                                <input 
                                    type="text" 
                                    value={settings.loginHeroImage}
                                    onChange={(e) => dispatch(setLoginHeroImage(e.target.value))}
                                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-brand-lilac/10 focus:border-brand-lilac transition-all" 
                                    placeholder="https://your-image-url.com/image.jpg"
                                />
                            ) : (
                                <button 
                                    onClick={() => heroFileInputRef.current?.click()}
                                    disabled={settings.uploadProgress['hero']}
                                    className="w-full py-8 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand-orange hover:text-brand-orange hover:bg-brand-orange/5 transition-all disabled:opacity-50 disabled:cursor-wait"
                                >
                                    <CloudUpload size={32} />
                                    <span className="text-sm font-bold">
                                        {settings.uploadProgress['hero'] ? 'Uploading...' : 'Click to Upload Hero Image'}
                                    </span>
                                </button>
                            )}

                            <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-500 leading-relaxed flex items-start gap-2">
                                <Info size={14} className="shrink-0 mt-0.5" />
                                <span>Accepted formats: PNG, JPG, SVG. Max 5 MB. Recommended resolution: 1920x1080 or higher.</span>
                            </div>

                            {/* Reset hero image button */}
                            {settings.uploadedHeroImage && (
                              <button
                                onClick={handleResetHero}
                                className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                                data-testid="reset-hero-image"
                              >
                                <RotateCcw size={14} /> Reset to Default Image
                              </button>
                            )}
                        </div>
                        <div className="aspect-video rounded-4xl overflow-hidden border border-gray-200 shadow-md relative group">
                            {settings.loginHeroImage ? (
                                <img 
                                    src={getUploadedFileUrl(settings.loginHeroImage) || undefined} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                    alt="Login Preview"
                                    onError={(e) => {
                                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="sans-serif"%3EInvalid URL%3C/text%3E%3C/svg%3E';
                                    }}
                                />
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
                    
                    {settings.testimonials.map((t: any, idx: number) => (
                        <div key={t.id} className="p-6 rounded-4xl bg-gray-50 border border-gray-200 space-y-4 relative">
                            <div className="absolute top-4 right-4 text-gray-300 font-bold text-6xl opacity-20 select-none">“</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Person Name</label>
                                    <input 
                                        type="text" 
                                        value={t.name} 
                                        onChange={(e) => dispatch(updateTestimonial({ id: t.id, field: 'name', value: e.target.value }))}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Role / Title</label>
                                    <input 
                                        type="text" 
                                        value={t.role} 
                                        onChange={(e) => dispatch(updateTestimonial({ id: t.id, field: 'role', value: e.target.value }))}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Quote Text</label>
                                <textarea 
                                    rows={3} 
                                    value={t.text} 
                                    onChange={(e) => dispatch(updateTestimonial({ id: t.id, field: 'text', value: e.target.value }))}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium resize-none" 
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                                    <img src={t.avatar} className="w-full h-full object-cover" alt={t.name} />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Avatar URL</label>
                                    <input 
                                        type="text" 
                                        value={t.avatar} 
                                        onChange={(e) => dispatch(updateTestimonial({ id: t.id, field: 'avatar', value: e.target.value }))}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-mono text-gray-500" 
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <ThemedButton variant="ghost" onClick={() => dispatch(addTestimonial())} icon={Plus} fullWidth className="py-4 border-2 border-dashed border-gray-300">
                        Add New Testimonial
                    </ThemedButton>
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
                    <ThemedButton variant="cancel" onClick={handleCreateRole} icon={Plus}>
                       Create New Role
                    </ThemedButton>
                    <div className="flex items-center gap-6 text-sm bg-gray-50 px-6 py-3 rounded-full">
                       <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-black shadow-sm"></span> <span className="font-bold text-brand-black">Admin (Ops)</span></div>
                       <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-lilac shadow-sm"></span> <span className="font-bold text-brand-black">School Admin</span></div>
                    </div>
                 </div>
              </div>

              <div className="grid gap-12">
                {settings.permissionGroups.map((group: any, groupIdx: number) => (
                  <div key={group.category} className="space-y-4">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                          {React.createElement(getIcon(group.iconName), { size: 16 })}
                        </div>
                        <h4 className="text-lg font-bold text-brand-black uppercase tracking-wide">{group.category}</h4>
                     </div>
                     
                     <div className="overflow-hidden rounded-4xl border border-gray-100 shadow-sm bg-white">
                        <table className="w-full text-left">
                           <thead className="bg-gray-50/50 text-gray-400 font-bold text-xs uppercase tracking-widest">
                              <tr>
                                 <th className="px-8 py-4 w-1/2">Permission Node</th>
                                 <th className="px-8 py-4 text-center w-1/4">Admin</th>
                                 <th className="px-8 py-4 text-center w-1/4">School Admin</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                              {group.permissions.map((perm: any) => (
                                 <tr key={perm.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                       <p className="font-bold text-brand-black text-sm">{perm.name}</p>
                                       <p className="text-xs font-medium text-gray-400 mt-1">{perm.description}</p>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                       <button 
                                         onClick={() => handlePermissionToggle(groupIdx, perm.id, 'admin')}
                                         className={`w-12 h-7 rounded-full relative transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-black/20 ${perm.admin ? 'bg-brand-black' : 'bg-gray-200'}`}
                                       >
                                          <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm flex items-center justify-center ${perm.admin ? 'translate-x-5' : 'translate-x-0'}`}>
                                            {perm.admin && <Check size={10} className="text-brand-black" />}
                                          </span>
                                       </button>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                       <button 
                                         onClick={() => handlePermissionToggle(groupIdx, perm.id, 'schoolAdmin')}
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

              {/* Custom Roles Section */}
              {settings.customRoles && settings.customRoles.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h4 className="text-lg font-bold text-brand-black uppercase tracking-wide">Custom Roles</h4>
                  <div className="grid gap-3">
                    {settings.customRoles.map((role: CustomRole) => (
                      <div key={role.id} className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-brand-black text-sm">{role.name}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              role.type === 'admin' ? 'bg-brand-black/10 text-brand-black' : 
                              role.type === 'school_admin' ? 'bg-brand-lilac/10 text-brand-lilac' : 
                              'bg-gray-200 text-gray-600'
                            }`}>{role.type.replace('_', ' ')}</span>
                          </div>
                          {role.description && <p className="text-xs text-gray-400 mt-1">{role.description}</p>}
                          <p className="text-[10px] text-gray-300 mt-1">Created {new Date(role.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteRole(role.id, role.name)}
                          className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Delete role"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
           </div>
        )}

        {activeTab === 'system' && (
           <div className="max-w-3xl space-y-10 animate-in fade-in duration-500">
              
              {/* Operating Days */}
              <div className="space-y-6">
                 <h3 className="text-xl font-bold text-brand-black flex items-center gap-3">
                    <Bus className="text-brand-green" size={24}/> Operating Days
                 </h3>
                 <p className="text-gray-500 text-sm">Select the days of the week your transport service operates. These days will be used across route scheduling.</p>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                       const isActive = (settings.operatingDays || []).includes(day);
                       return (
                          <button
                             key={day}
                             onClick={() => {
                                const current = settings.operatingDays || [];
                                const updated = isActive
                                   ? current.filter((d: string) => d !== day)
                                   : [...current, day];
                                dispatch(setOperatingDays(updated));
                             }}
                             className={`px-5 py-4 rounded-2xl text-sm font-bold transition-all border ${
                                isActive
                                   ? 'text-white border-transparent shadow-lg'
                                   : 'text-gray-500 bg-gray-50 border-gray-100 hover:border-gray-300'
                             }`}
                             style={isActive ? { backgroundColor: settings.colors.primary } : undefined}
                          >
                             {day}
                          </button>
                       );
                    })}
                 </div>
              </div>

              <div className="w-full h-px bg-gray-100"></div>

              <div className="space-y-6">
                 <h3 className="text-xl font-bold text-brand-black flex items-center gap-3">
                    <Server className="text-blue-500" size={24}/> Feature Flags
                 </h3>
                 <p className="text-gray-500 text-sm">Experimental features and white-label configurations.</p>
                 
                 <div className="space-y-4">
                    {/* White Labelling */}
                    <div className="rounded-4xl bg-gray-50 border border-gray-100 overflow-hidden">
                       <div className="flex items-center justify-between p-6">
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
                             <input type="checkbox" className="sr-only peer" checked={settings.featureFlags?.whiteLabelling ?? false} onChange={(e) => dispatch(setFeatureFlag({ flag: 'whiteLabelling', value: e.target.checked }))} />
                             <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-black"></div>
                          </label>
                       </div>
                       {settings.featureFlags?.whiteLabelling && (
                         <div className="px-6 pb-6 pt-0">
                           <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3">
                             <div className="flex items-center justify-between">
                               <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">White-Labelled Schools</label>
                               <div className="relative">
                                 <button 
                                   onClick={() => setShowSchoolSelector(!showSchoolSelector)}
                                   className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-black hover:bg-gray-100 transition-colors"
                                 >
                                   Select Schools <ChevronDown size={12} />
                                 </button>
                                 {showSchoolSelector && (
                                   <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                     {SCHOOLS.map(school => {
                                       const isSelected = (settings.whiteLabelSchools || []).includes(school.id);
                                       return (
                                         <button
                                           key={school.id}
                                           onClick={() => {
                                             const current = settings.whiteLabelSchools || [];
                                             const updated = isSelected
                                               ? current.filter((id: string) => id !== school.id)
                                               : [...current, school.id];
                                             dispatch(setWhiteLabelSchools(updated));
                                           }}
                                           className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl flex items-center justify-between transition-colors mb-0.5 ${
                                             isSelected ? 'bg-brand-black/5 text-brand-black' : 'text-gray-500 hover:bg-gray-50'
                                           }`}
                                         >
                                           {school.name}
                                           {isSelected && <Check size={14} className="text-brand-green" />}
                                         </button>
                                       );
                                     })}
                                   </div>
                                 )}
                               </div>
                             </div>
                             {(settings.whiteLabelSchools || []).length > 0 ? (
                               <div className="flex flex-wrap gap-2">
                                 {(settings.whiteLabelSchools || []).map((schoolId: string) => {
                                   const school = SCHOOLS.find(s => s.id === schoolId);
                                   return school ? (
                                     <span key={schoolId} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-black/5 rounded-full text-xs font-bold text-brand-black">
                                       {school.name}
                                       <button 
                                         onClick={() => dispatch(setWhiteLabelSchools((settings.whiteLabelSchools || []).filter((id: string) => id !== schoolId)))}
                                         className="hover:text-red-500 transition-colors"
                                       >
                                         <X size={12} />
                                       </button>
                                     </span>
                                   ) : null;
                                 })}
                               </div>
                             ) : (
                               <p className="text-xs text-gray-400">No schools selected for white labelling.</p>
                             )}
                           </div>
                         </div>
                       )}
                    </div>

                    {/* Beta Payment Gateway */}
                    <div className="flex items-center justify-between p-6 rounded-4xl bg-gray-50 border border-gray-100">
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
                          <input type="checkbox" className="sr-only peer" checked={settings.featureFlags?.betaPaymentGateway ?? false} onChange={(e) => dispatch(setFeatureFlag({ flag: 'betaPaymentGateway', value: e.target.checked }))} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-black"></div>
                       </label>
                    </div>

                    {/* Demo Mode */}
                    <div className="flex items-center justify-between p-6 rounded-4xl bg-amber-50 border border-amber-200">
                       <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-600 shadow-sm">
                             <FlaskConical size={20} />
                          </div>
                          <div>
                             <h4 className="font-bold text-brand-black">Demo Mode</h4>
                             <p className="text-xs text-gray-500 mt-1 max-w-sm">Enable demo login buttons and mock data on the login page. Disable for production to use real API endpoints only.</p>
                          </div>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={settings.featureFlags?.demoMode ?? true} onChange={(e) => dispatch(setFeatureFlag({ flag: 'demoMode', value: e.target.checked }))} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                       </label>
                    </div>

                    {/* Social Sign-in */}
                    <div className="flex items-center justify-between p-6 rounded-4xl bg-gray-50 border border-gray-100">
                       <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm">
                             <Users size={20} />
                          </div>
                          <div>
                             <h4 className="font-bold text-brand-black">Social Sign-in</h4>
                             <p className="text-xs text-gray-500 mt-1 max-w-sm">Allow users to sign in using Google and other social identity providers on the login page.</p>
                          </div>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={settings.featureFlags?.socialSignIn ?? false} onChange={(e) => dispatch(setFeatureFlag({ flag: 'socialSignIn', value: e.target.checked }))} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-black"></div>
                       </label>
                    </div>
                 </div>
              </div>

           </div>
        )}

        {activeTab === 'endpoints' && (
          <EndpointsSettingsTab />
        )}
      </div>

      {/* Create Role Modal */}
      {showCreateRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-in fade-in duration-200" onClick={() => setShowCreateRole(false)}>
          <div className="bg-white rounded-4xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-brand-black text-lg">Create New Role</h4>
              <button onClick={() => setShowCreateRole(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Role Name</label>
                <input 
                  type="text" 
                  value={newRoleName} 
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Fleet Manager"
                  className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-brand-lilac/10 focus:border-brand-lilac transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Role Type</label>
                <div className="flex gap-2">
                  {(['admin', 'school_admin', 'custom'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setNewRoleType(type)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        newRoleType === type 
                          ? 'bg-brand-black text-white border-brand-black' 
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {type === 'admin' ? 'Admin' : type === 'school_admin' ? 'School Admin' : 'Custom'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  rows={3} 
                  value={newRoleDesc} 
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Brief description of this role's responsibilities"
                  className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium resize-none focus:ring-4 focus:ring-brand-lilac/10 focus:border-brand-lilac transition-all" 
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <ThemedButton variant="cancel" onClick={() => setShowCreateRole(false)}>Cancel</ThemedButton>
              <ThemedButton variant="primary" onClick={handleSaveNewRole}>Create Role</ThemedButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};