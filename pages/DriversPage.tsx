import React, { useState } from 'react';
import { useTheme } from '../src/hooks/useTheme';
import { ThemedButton } from '../src/components/ThemedComponents';
import { ThemedModal } from '../src/components/ThemedModal';
import { ThemedInput } from '../src/components/ThemedFormField';
import { Search, Filter, Plus, Phone, Car, QrCode, Download, Edit, Check, MoreHorizontal, LayoutGrid, List as ListIcon } from 'lucide-react';
import { User as UserType } from '../types';

interface DriversPageProps {
 currentUser: UserType;
 showHeader?: boolean;
}

const INITIAL_DRIVERS = [
 { id: 'D1', name: 'James Wilson', vehicle: 'Toyota Coaster (BUS-101)', phone: '+1 234 567 890', email: 'james.w@transport.com', license: 'EXP-2025', status: 'ON_TRIP', avatar: 'https://picsum.photos/150', corporate: 'TechCorp Inc.' },
 { id: 'D2', name: 'Robert Chen', vehicle: 'Mercedes Sprinter (BUS-102)', phone: '+1 234 567 891', email: 'robert.c@transport.com', license: 'EXP-2024', status: 'AVAILABLE', avatar: 'https://picsum.photos/151', corporate: 'City Schools' },
 { id: 'D3', name: 'Sarah Miller', vehicle: 'Ford Transit (BUS-205)', phone: '+1 234 567 892', email: 'sarah.m@transport.com', license: 'EXP-2026', status: 'OFF_DUTY', avatar: 'https://picsum.photos/152', corporate: 'Global Logistics' },
 { id: 'D4', name: 'David Kim', vehicle: 'Unassigned', phone: '+1 234 567 893', email: 'david.k@transport.com', license: 'PENDING', status: 'PENDING', avatar: 'https://picsum.photos/153', corporate: 'Unassigned' },
];

export const DriversPage: React.FC<DriversPageProps> = ({ currentUser, showHeader = true }) => {
 const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
 const { colors } = useTheme();
 const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
 const [searchTerm, setSearchTerm] = useState('');
 
 // Modals
 const [qrModalOpen, setQrModalOpen] = useState(false);
 const [registerModalOpen, setRegisterModalOpen] = useState(false);
 
 // Selection
 const [selectedDriverId, setSelectedDriverId] = useState('');
 const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
 
 // Edit/Register State
 const [driverForm, setDriverForm] = useState<any>({ name: '', vehicle: '', phone: '', email: '' });
 const [isEditing, setIsEditing] = useState(false);
 const [openActionId, setOpenActionId] = useState<string | null>(null);

 const filteredDrivers = drivers.filter(d => 
 d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
 d.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
 );

 const toggleAction = (id: string, e: React.MouseEvent) => {
 e.stopPropagation();
 setOpenActionId(openActionId === id ? null : id);
 };

 const handleGenerateCode = () => {
 if (!selectedDriverId) return;
 const code = Math.floor(100000 + Math.random() * 900000).toString();
 setGeneratedOtp(`${code.slice(0,3)}-${code.slice(3)}`);
 };

 const selectedDriver = drivers.find(d => d.id === selectedDriverId);

 const handleSaveDriver = () => {
 if (isEditing) {
 setDrivers(drivers.map(d => d.id === driverForm.id ? { ...d, ...driverForm } : d));
 } else {
 const newDriver = {
 ...driverForm,
 id: `D${drivers.length + 5}`,
 license: 'PENDING',
 status: 'AVAILABLE',
 avatar: `https://picsum.photos/15${drivers.length + 5}`,
 vehicle: driverForm.vehicle || 'Unassigned'
 };
 setDrivers([...drivers, newDriver]);
 }
 setRegisterModalOpen(false);
 };

 const openRegister = () => {
 setIsEditing(false);
 setDriverForm({ name: '', vehicle: '', phone: '', email: '' });
 setRegisterModalOpen(true);
 };

 const openEdit = (driver: any) => {
 setIsEditing(true);
 setDriverForm(driver);
 setRegisterModalOpen(true);
 setOpenActionId(null);
 };

 const downloadQR = () => {
 alert("Downloading QR Code Access Card for " + selectedDriver?.name);
 };

 return (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative" onClick={() => setOpenActionId(null)}>
 
 {/* Header */}
 {showHeader && (
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
 <div>
 <h1 className="text-5xl font-medium text-brand-black tracking-tight mb-2">Drivers</h1>
 <p className="text-gray-500 font-normal text-xl">Manage fleet personnel & assignments.</p>
 </div>
 
 <div className="flex gap-3">
 <ThemedButton variant="ghost" onClick={() => { setQrModalOpen(true); setSelectedDriverId(''); setGeneratedOtp(null); }} icon={QrCode}>
 Driver QR
 </ThemedButton>
 <ThemedButton variant="primary" onClick={openRegister} icon={Plus}>
 Register Driver
 </ThemedButton>

 {/* View Toggle - Moved to Right */}
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
 </div>
 )}

 {/* Inline action bar when embedded */}
 {!showHeader && (
 <div className="flex items-center justify-end gap-3 px-2">
 <ThemedButton variant="ghost" onClick={() => { setQrModalOpen(true); setSelectedDriverId(''); setGeneratedOtp(null); }} icon={QrCode}>
 Driver QR
 </ThemedButton>
 <ThemedButton variant="primary" onClick={openRegister} icon={Plus}>
 Register Driver
 </ThemedButton>
 <div className="flex bg-white p-1 rounded-full border border-gray-200 shadow-sm ml-2">
 <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-full transition-all ${viewMode === 'grid' ? 'bg-brand-black text-white shadow-md' : 'text-gray-400 hover:text-brand-black'}`}>
 <LayoutGrid size={18} strokeWidth={2} />
 </button>
 <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-full transition-all ${viewMode === 'list' ? 'bg-brand-black text-white shadow-md' : 'text-gray-400 hover:text-brand-black'}`}>
 <ListIcon size={18} strokeWidth={2} />
 </button>
 </div>
 </div>
 )}

 {viewMode === 'grid' ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
 {filteredDrivers.map(driver => (
 <div key={driver.id} className="bg-white rounded-[2.5rem] p-6 shadow-soft-xl border border-gray-100 hover:shadow-2xl transition-all group relative flex flex-col items-center text-center">
 <div className="absolute top-6 right-6">
 <button 
 onClick={(e) => toggleAction(driver.id, e)}
 className="p-2 rounded-full text-gray-300 hover:text-brand-black hover:bg-gray-50 transition-colors"
 >
 <MoreHorizontal size={20} />
 </button>
 {openActionId === driver.id && (
 <div className="absolute right-0 top-10 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200 text-left">
 <button 
 onClick={() => { 
 setSelectedDriverId(driver.id); 
 setQrModalOpen(true); 
 handleGenerateCode();
 setOpenActionId(null);
 }}
 className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors"
 >
 <QrCode size={14} /> Generate QR
 </button>
 <button 
 onClick={() => { openEdit(driver); }}
 className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors"
 >
 <Edit size={14} /> Edit Profile
 </button>
 </div>
 )}
 </div>

 <img src={driver.avatar} className="w-24 h-24 rounded-3xl object-cover shadow-lg border border-white mb-4" />
 
 <h4 className="text-xl font-bold text-brand-black mb-1">{driver.name}</h4>
 <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-4">
 <Phone size={12}/> {driver.phone}
 </div>

 <div className="w-full bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
 <div className="flex justify-between items-center mb-2">
 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vehicle</span>
 <span className="text-xs font-bold text-brand-black">{driver.vehicle.split('(')[0]}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">License</span>
 <span className="text-xs font-bold text-brand-lilac bg-brand-lilac/10 px-2 py-0.5 rounded-md">{driver.license}</span>
 </div>
 </div>

 <div className="mt-auto">
 <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide border ${driver.status === 'ON_TRIP' ? 'bg-brand-amber/10 text-brand-amber border-brand-amber/20' : driver.status === 'AVAILABLE' ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
 <div className={`w-2 h-2 rounded-full ${driver.status === 'ON_TRIP' ? 'bg-brand-amber animate-pulse' : driver.status === 'AVAILABLE' ? 'bg-brand-green' : 'bg-gray-300'}`}></div>
 {driver.status.replace('_', ' ')}
 </span>
 </div>
 </div>
 ))}
 </div>
 ) : (
 /* List View */
 <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[600px] overflow-hidden">
 
 {/* Controls */}
 <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
 <div className="relative w-full md:w-96 group">
 <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-brand-lilac transition-colors"><Search size={20} /></div>
 <input
 type="text"
 placeholder="Search drivers..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-4 focus:ring-brand-lilac/10 text-sm font-bold placeholder:text-gray-400 transition-all shadow-sm"
 />
 </div>
 <ThemedButton variant="ghost" icon={Filter}>
 Filter Status
 </ThemedButton>
 </div>

 {/* Flat Table */}
 <table className="w-full text-left">
 <thead className="bg-gray-50/50 text-gray-400 font-bold text-xs uppercase tracking-widest">
 <tr>
 <th className="px-8 py-6 pl-10">Driver Profile</th>
 <th className="px-8 py-6">Vehicle</th>
 <th className="px-8 py-6">Documents</th>
 <th className="px-8 py-6">Status</th>
 <th className="px-8 py-6 text-right pr-10">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {filteredDrivers.map(driver => (
 <tr key={driver.id} className="hover:bg-gray-50/80 transition-colors group cursor-pointer">
 <td className="px-8 py-5 pl-10">
 <div className="flex items-center gap-4">
 <img src={driver.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-gray-100" />
 <div>
 <h4 className="text-base font-bold text-brand-black">{driver.name}</h4>
 <div className="flex gap-2 mt-1">
 <span className="text-xs text-gray-400 flex items-center gap-1"><Phone size={10}/> {driver.phone}</span>
 </div>
 </div>
 </div>
 </td>
 <td className="px-8 py-5">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><Car size={16}/></div>
 <div>
 <p className="font-bold text-sm text-brand-black">{driver.vehicle.split('(')[0]}</p>
 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{driver.vehicle.match(/\(([^)]+)\)/)?.[1] || 'Unassigned'}</p>
 </div>
 </div>
 </td>
 <td className="px-8 py-5">
 <span className="px-3 py-1.5 rounded-xl bg-gray-50 text-xs font-bold text-gray-500 border border-gray-100">{driver.license}</span>
 </td>
 <td className="px-8 py-5">
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 rounded-full ${driver.status === 'ON_TRIP' ? 'bg-brand-amber animate-pulse' : driver.status === 'AVAILABLE' ? 'bg-brand-green' : 'bg-gray-300'}`}></div>
 <span className={`text-xs font-bold uppercase tracking-wider ${driver.status === 'ON_TRIP' ? 'text-brand-amber' : driver.status === 'AVAILABLE' ? 'text-brand-green' : 'text-gray-400'}`}>
 {driver.status.replace('_', ' ')}
 </span>
 </div>
 </td>
 <td className="px-8 py-5 text-right pr-10 relative">
 <button 
 onClick={(e) => toggleAction(driver.id, e)}
 className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:bg-brand-black hover:text-white transition-all z-10 relative"
 >
 <MoreHorizontal size={20} />
 </button>

 {openActionId === driver.id && (
 <div className="absolute right-10 top-12 mt-0 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200">
 <button 
 onClick={(e) => { 
 e.stopPropagation(); 
 setSelectedDriverId(driver.id); 
 setQrModalOpen(true); 
 handleGenerateCode();
 setOpenActionId(null);
 }}
 className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors"
 >
 <QrCode size={14} /> Generate QR
 </button>
 <button 
 onClick={(e) => { e.stopPropagation(); openEdit(driver); }}
 className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors"
 >
 <Edit size={14} /> Edit Profile
 </button>
 </div>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 
 {/* Generate QR Modal */}
 <ThemedModal
   isOpen={qrModalOpen}
   onClose={() => setQrModalOpen(false)}
   title="Driver Access Code"
   size="md"
   showFooter={false}
 >
   <div className="mb-6">
     <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Select Driver</label>
     <select 
       value={selectedDriverId}
       onChange={(e) => { setSelectedDriverId(e.target.value); setGeneratedOtp(null); }}
       className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-brand-black focus:ring-2 focus:ring-brand-black/10 focus:border-brand-black outline-none transition-all appearance-none"
     >
       <option value="" disabled>-- Choose Driver --</option>
       {drivers.map(d => (
         <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
       ))}
     </select>
   </div>

   {selectedDriverId && (
     <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2">
       <div className="w-full bg-gray-50 rounded-3xl p-6 border border-gray-100 flex flex-col items-center mb-6">
         <div className="w-16 h-16 rounded-full bg-white shadow-sm mb-3 overflow-hidden">
           <img src={selectedDriver?.avatar} className="w-full h-full object-cover" />
         </div>
         <h4 className="font-bold text-lg text-brand-black">{selectedDriver?.name}</h4>
         <p className="text-xs text-gray-500 mb-6">{selectedDriver?.vehicle}</p>
         
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
           <QrCode size={140} className="text-brand-black" />
         </div>
         
         {generatedOtp ? (
           <div className="flex flex-col items-center">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">One-Time Passcode</p>
             <div className="text-3xl font-mono font-bold text-brand-black tracking-widest">{generatedOtp}</div>
           </div>
         ) : (
           <ThemedButton variant="primary" onClick={handleGenerateCode} className="text-xs">
             Generate Code
           </ThemedButton>
         )}
       </div>

       <ThemedButton variant="ghost" onClick={downloadQR} icon={Download} fullWidth>
         Download Access Card
       </ThemedButton>
     </div>
   )}
 </ThemedModal>

 {/* Register/Edit Driver Modal */}
 <ThemedModal
   isOpen={registerModalOpen}
   onClose={() => setRegisterModalOpen(false)}
   title={isEditing ? 'Edit Driver' : 'Register Driver'}
   size="lg"
   footer={
     <ThemedButton 
       variant="primary"
       onClick={handleSaveDriver}
       icon={Check}
     >
       {isEditing ? 'Save Changes' : 'Register Driver'}
     </ThemedButton>
   }
 >
   <div className="space-y-4">
     <ThemedInput
       label="Full Name"
       type="text"
       value={driverForm.name}
       onChange={e => setDriverForm({...driverForm, name: e.target.value})}
     />
     <ThemedInput
       label="Phone"
       type="text"
       value={driverForm.phone}
       onChange={e => setDriverForm({...driverForm, phone: e.target.value})}
     />
     <ThemedInput
       label="Vehicle"
       type="text"
       value={driverForm.vehicle}
       onChange={e => setDriverForm({...driverForm, vehicle: e.target.value})}
       placeholder="e.g. BUS-101"
     />
   </div>
 </ThemedModal>

 </div>
 );
};