import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, Shield, Save, User, Check, AlertCircle, PieChart, Users, Bus, Map as MapIcon, Wallet, Layers, ToggleRight, Plus, Server, Code, Palette, Image as ImageIcon, MessageSquare, Monitor, Upload, CloudUpload } from 'lucide-react';
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
  setPermissionGroups
} from '../src/store/slices/settingsSlice';
import { addToast } from '../src/store/slices/uiSlice';
import { getUploadedFileUrl } from '../src/services/fileUploadService';

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
  const [activeTab, setActiveTab] = useState('general');

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
          ]
        }
      ]));
    }
  }, [dispatch, settings.permissionGroups.length]);

  const handlePermissionToggle = (groupIdx: number, permId: string, role: 'admin' | 'schoolAdmin') => {
    dispatch(togglePermission({ groupIdx, permId, role }));
  };

  const handleSave = async () => {
    console.log('💾💾💾 SAVE BUTTON CLICKED!!!');
    console.log('Current settings state:', settings);
    
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
        permissionGroups: settings.permissionGroups
      };
      
      console.log('💾 Settings Save - Preparing to save:', dataToSave);
      console.log('📸 Settings Save - Current logoUrls:', settings.logoUrls);
      console.log('📸 Settings Save - Current uploadedLogos:', settings.uploadedLogos);
      
      // @ts-ignore - async thunk from JS file
      await (dispatch as any)(updateSettings(dataToSave)).unwrap();
      
      console.log('✅ Settings Save - Successfully saved!');
      
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
    dispatch(addToast({
      message: 'Role Creation Wizard would open here.',
      type: 'info',
      duration: 3000
    }));
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
    console.log('🚀🚀🚀 LOGO UPLOAD TRIGGERED!!! Mode:', mode);
    
    const file = e.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    console.log(`🎨 Logo Upload - Starting upload for ${mode} mode:`, { fileName: file.name, fileSize: file.size, fileType: file.type });

    if (!file.type.startsWith('image/')) {
      console.error('❌ Logo Upload - Invalid file type:', file.type);
      dispatch(addToast({
        message: 'Please select a valid image file',
        type: 'error',
        duration: 5000
      }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      console.error('❌ Logo Upload - File too large:', file.size);
      dispatch(addToast({
        message: 'Logo size must be less than 2MB',
        type: 'error',
        duration: 5000
      }));
      return;
    }

    try {
      console.log(`📤 Logo Upload - Dispatching uploadImage thunk for logo-${mode}...`);
      // @ts-ignore - async thunk from JS file
      const result = await (dispatch as any)(uploadImage({ file, type: `logo-${mode}` })).unwrap();
      console.log(`✅ Logo Upload - Upload successful for logo-${mode}:`, result);
      console.log(`📊 Logo Upload - Current logoUrls state:`, settings.logoUrls);
      dispatch(addToast({
        message: `${mode === 'platform' ? 'Platform' : mode === 'light' ? 'Light' : 'Dark'} mode logo uploaded successfully!`,
        type: 'success',
        duration: 5000
      }));
    } catch (error) {
      console.error(`❌ Logo Upload - Failed for logo-${mode}:`, error);
      dispatch(addToast({
        message: `Failed to upload logo: ${error}`,
        type: 'error',
        duration: 5000
      }));
    }

    e.target.value = '';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hidden file inputs */}
      <input 
        type="file" 
        ref={heroFileInputRef} 
        onChange={handleHeroImageUpload} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={logoLightFileInputRef} 
        onChange={(e) => handleLogoUpload(e, 'light')} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={logoDarkFileInputRef} 
        onChange={(e) => handleLogoUpload(e, 'dark')} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={logoPlatformFileInputRef} 
        onChange={(e) => handleLogoUpload(e, 'platform')} 
        accept="image/*" 
        className="hidden" 
      />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-5xl font-medium text-brand-black tracking-tight mb-2">Settings</h1>
          <p className="text-gray-500 font-normal text-xl">Configure platform preferences and permissions.</p>
        </div>
        <button 
            onClick={handleSave}
            disabled={settings.loading}
            className="bg-brand-black hover:bg-gray-900 text-white px-8 py-3.5 rounded-full text-sm font-bold shadow-xl shadow-brand-black/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} strokeWidth={2} /> 
          <span>{settings.loading ? 'Saving...' : 'Save Changes'}</span>
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                                                    <img src={getUploadedFileUrl(settings.uploadedLogos.light)} alt="Light logo preview" className="w-12 h-12 object-contain rounded" />
                                                    <span className="text-xs text-gray-500 font-medium flex-1 truncate">Uploaded</span>
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
                                                <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3 border border-gray-200">
                                                    <img src={getUploadedFileUrl(settings.uploadedLogos.dark)} alt="Dark logo preview" className="w-12 h-12 object-contain rounded bg-gray-800" />
                                                    <span className="text-xs text-gray-500 font-medium flex-1 truncate">Uploaded</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Platform/Navigation Logo */}
                            <div className="space-y-2 pt-4 border-t border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Navigation Logo (Used in header & login)</span>
                                {settings.logoMode === 'url' ? (
                                    <input 
                                        type="text" 
                                        placeholder="https://... (Platform Logo)"
                                        value={settings.logoUrls.platform || ''}
                                        onChange={(e) => dispatch(setLogoUrls({ platform: e.target.value }))}
                                        className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-brand-lilac/10 focus:border-brand-lilac transition-all" 
                                    />
                                ) : (
                                    <div className="space-y-2">
                                        <button 
                                            onClick={() => logoPlatformFileInputRef.current?.click()}
                                            disabled={settings.uploadProgress['logo-platform']}
                                            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand-black hover:text-brand-black hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            <CloudUpload size={24} />
                                            <span className="text-xs font-bold">
                                                {settings.uploadProgress['logo-platform'] ? 'Uploading...' : 'Upload Platform Logo'}
                                            </span>
                                        </button>
                                        {settings.uploadedLogos.platform && (
                                            <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                                                <img src={getUploadedFileUrl(settings.uploadedLogos.platform)} alt="Platform logo preview" className="w-12 h-12 object-contain rounded" />
                                                <span className="text-xs text-gray-500 font-medium flex-1 truncate">Uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                )}
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

                            <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-500 leading-relaxed">
                                Tip: Use high-resolution images (at least 1920x1080) for the best result on large screens.
                            </div>
                        </div>
                        <div className="aspect-video rounded-[2rem] overflow-hidden border border-gray-200 shadow-md relative group">
                            {settings.loginHeroImage ? (
                                <img 
                                    src={getUploadedFileUrl(settings.loginHeroImage)} 
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
                        <div key={t.id} className="p-6 rounded-[2rem] bg-gray-50 border border-gray-200 space-y-4 relative">
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
                    <button 
                        onClick={() => dispatch(addTestimonial())} 
                        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-[2rem] text-gray-400 font-bold text-sm hover:border-brand-black hover:text-brand-black transition-all flex items-center justify-center gap-2"
                    >
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
                {settings.permissionGroups.map((group: any, groupIdx: number) => (
                  <div key={group.category} className="space-y-4">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                          {React.createElement(getIcon(group.iconName), { size: 16 })}
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