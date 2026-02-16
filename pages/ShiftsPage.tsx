import React, { useState } from 'react';
import { useTheme } from '../src/hooks/useTheme';
import { ThemedButton } from '../src/components/ThemedComponents';
import { ThemedModal } from '../src/components/ThemedModal';
import { ThemedInput, ThemedSelect, ThemedTextarea, ThemedTimeInput } from '../src/components/ThemedFormField';
import { ThemedDataTable, TableColumn } from '../src/components/ThemedDataTable';
import { Calendar, Plus, Edit2, Copy, Trash2, Search, Download } from 'lucide-react';
import { User, UserRole } from '../types';

interface ShiftsPageProps {
 currentUser?: User;
 showHeader?: boolean;
}

interface Shift {
 id: string;
 shiftName: string;
 shiftCode: string;
 school: string;
 drivers: string[];
 days: string[];
 scheduledTime: string;
 actualTime?: string;
 assignedRoute: string;
 status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
 notes?: string;
}

const MOCK_SHIFTS: Shift[] = [
 {
 id: 'SH-001',
 shiftName: 'Morning Pickup - Route A',
 shiftCode: 'MP-A',
 school: 'Greenfield Academy',
 drivers: ['James Wilson', 'Sarah Parker'],
 days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
 scheduledTime: '06:30 AM',
 actualTime: '06:28 AM',
 assignedRoute: 'Route A - North',
 status: 'ACTIVE',
 notes: 'Regular morning shift'
 },
 {
 id: 'SH-002',
 shiftName: 'Afternoon Drop-off - Route B',
 shiftCode: 'AD-B',
 school: 'Greenfield Academy',
 drivers: ['Michael Chen'],
 days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
 scheduledTime: '03:30 PM',
 assignedRoute: 'Route B - South',
 status: 'ACTIVE'
 },
 {
 id: 'SH-003',
 shiftName: 'Weekend Activity Shift',
 shiftCode: 'WK-01',
 school: 'Innovation High',
 drivers: ['Emily Rodriguez'],
 days: ['Sat'],
 scheduledTime: '09:00 AM',
 assignedRoute: 'City Route',
 status: 'INACTIVE',
 notes: 'Sports events only'
 }
];

export const ShiftsPage: React.FC<ShiftsPageProps> = ({ currentUser, showHeader = true }) => {
 const [shifts, setShifts] = useState<Shift[]>(MOCK_SHIFTS);
 const { colors } = useTheme();
 const [searchTerm, setSearchTerm] = useState('');
 const [selectedSchool, setSelectedSchool] = useState('');
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingShift, setEditingShift] = useState<Shift | null>(null);
 const [shiftForm, setShiftForm] = useState<Partial<Shift>>({
 shiftName: '', shiftCode: '', school: '', drivers: [], days: [],
 scheduledTime: '', assignedRoute: '', status: 'ACTIVE', notes: ''
 });

 const shiftColumns: TableColumn<Shift>[] = [
   { key: 'id', header: 'Shift ID', render: (shift) => (
     <span className="font-mono text-sm text-gray-600">{shift.id}</span>
   )},
   { key: 'name', header: 'Shift Name', render: (shift) => (
     <div>
       <p className="font-bold text-brand-black">{shift.shiftName}</p>
       <p className="text-xs text-gray-400 font-mono">{shift.shiftCode}</p>
     </div>
   )},
   { key: 'drivers', header: 'Drivers', render: (shift) => (
     <div className="flex flex-col gap-1">
       {shift.drivers.map((driver, idx) => (
         <span key={idx} className="text-sm text-gray-600">{driver}</span>
       ))}
     </div>
   )},
   { key: 'days', header: 'Days', render: (shift) => (
     <div className="flex flex-wrap gap-1">
       {shift.days.map((day, idx) => (
         <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">
           {day}
         </span>
       ))}
     </div>
   )},
   { key: 'scheduled', header: 'Scheduled', render: (shift) => (
     <span className="text-sm text-gray-600">{shift.scheduledTime}</span>
   )},
   { key: 'actual', header: 'Actual', render: (shift) => (
     <span className="text-sm text-gray-600">{shift.actualTime || '-'}</span>
   )},
   { key: 'route', header: 'Route', render: (shift) => (
     <span className="text-sm text-gray-600">{shift.assignedRoute}</span>
   )},
   { key: 'status', header: 'Status', render: (shift) => (
     <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusBadge(shift.status)}`}>
       {shift.status}
     </span>
   )},
 ];

 const filteredShifts = shifts.filter(shift => {
 const matchesSearch = shift.shiftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
 shift.shiftCode.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesSchool = !selectedSchool || shift.school === selectedSchool;
 return matchesSearch && matchesSchool;
 });

 const openCreateModal = () => {
 setEditingShift(null);
 setShiftForm({ shiftName: '', shiftCode: '', school: '', drivers: [], days: [], scheduledTime: '', assignedRoute: '', status: 'ACTIVE', notes: '' });
 setIsModalOpen(true);
 };

 const openEditModal = (shift: Shift) => {
 setEditingShift(shift);
 setShiftForm({ ...shift });
 setIsModalOpen(true);
 };

 const handleClone = (shift: Shift) => {
 const cloned: Shift = { ...shift, id: `SH-${String(shifts.length + 1).padStart(3, '0')}`, shiftName: `${shift.shiftName} (Copy)` };
 setShifts([...shifts, cloned]);
 };

 const handleDelete = (id: string) => {
 if (window.confirm('Are you sure you want to delete this shift?')) {
 setShifts(shifts.filter(s => s.id !== id));
 }
 };

 const handleSave = () => {
 if (!shiftForm.shiftName || !shiftForm.school) return;
 if (editingShift) {
 setShifts(shifts.map(s => s.id === editingShift.id ? { ...s, ...shiftForm } as Shift : s));
 } else {
 const newShift: Shift = {
 id: `SH-${String(shifts.length + 1).padStart(3, '0')}`,
 shiftName: shiftForm.shiftName || '',
 shiftCode: shiftForm.shiftCode || '',
 school: shiftForm.school || '',
 drivers: shiftForm.drivers || [],
 days: shiftForm.days || [],
 scheduledTime: shiftForm.scheduledTime || '',
 assignedRoute: shiftForm.assignedRoute || '',
 status: (shiftForm.status as Shift['status']) || 'ACTIVE',
 notes: shiftForm.notes,
 };
 setShifts([...shifts, newShift]);
 }
 setIsModalOpen(false);
 };

 const toggleDay = (day: string) => {
 const current = shiftForm.days || [];
 setShiftForm({ ...shiftForm, days: current.includes(day) ? current.filter(d => d !== day) : [...current, day] });
 };

 const getStatusBadge = (status: string) => {
 const colors = {
 ACTIVE: 'bg-green-50 text-green-600 border-green-100',
 INACTIVE: 'bg-gray-50 text-gray-600 border-gray-100',
 COMPLETED: 'bg-blue-50 text-blue-600 border-blue-100'
 };
 return colors[status as keyof typeof colors] || colors.ACTIVE;
 };

 return (
 <div className="space-y-8 animate-in fade-in duration-700">
 
 {/* Header */}
 {showHeader && (
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
 <div>
 <h1 className="text-5xl font-medium text-brand-black tracking-tight mb-2">Shifts</h1>
 <p className="text-gray-500 font-normal text-xl">Manage driver schedules and shift assignments.</p>
 </div>
 <ThemedButton variant="primary" onClick={openCreateModal} icon={Plus}>
 Add Shift
 </ThemedButton>
 </div>
 )}

 {!showHeader && (
 <div className="flex items-center justify-end px-2">
 <ThemedButton variant="primary" onClick={openCreateModal} icon={Plus}>
 Add Shift
 </ThemedButton>
 </div>
 )}

 {/* Filters */}
 <div className="bg-white rounded-[2.5rem] p-8 shadow-soft-xl border border-gray-100">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {/* School Filter */}
 <div>
 <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
 School
 </label>
 <select
 value={selectedSchool}
 onChange={(e) => setSelectedSchool(e.target.value)}
 className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-black focus:ring-2 focus:ring-/20 outline-none transition-all"
 >
 <option value="">All Schools</option>
 <option value="Greenfield Academy">Greenfield Academy</option>
 <option value="Innovation High">Innovation High</option>
 <option value="City College">City College</option>
 </select>
 </div>

 {/* Search */}
 <div>
 <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
 Search
 </label>
 <div className="relative">
 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="Shift name, code..."
 className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-black focus:ring-2 focus:ring-/20 outline-none transition-all"
 />
 </div>
 </div>

 {/* Export */}
 <div className="flex items-end">
 <ThemedButton variant="ghost" icon={Download} fullWidth>
 Export
 </ThemedButton>
 </div>
 </div>
 </div>

 {/* Shifts Table */}
 <ThemedDataTable<Shift>
   columns={shiftColumns}
   data={filteredShifts}
   rowKey={(item) => item.id}
   renderActions={(shift) => (
     <div className="flex items-center gap-2">
       <ThemedButton variant="icon" onClick={() => openEditModal(shift)}>
         <Edit2 size={16} />
       </ThemedButton>
       <ThemedButton variant="icon" onClick={() => handleClone(shift)}>
         <Copy size={16} />
       </ThemedButton>
       <ThemedButton variant="icon" onClick={() => handleDelete(shift.id)} style={{ color: '#dc2626' }}>
         <Trash2 size={16} />
       </ThemedButton>
     </div>
   )}
   actionsHeader="Actions"
   container={true}
   emptyIcon={<Calendar size={48} className="text-gray-300" />}
   emptyTitle="No shifts found"
   emptySubtitle="Try adjusting your filters or create a new shift"
 />

 {/* Add/Edit Shift Modal */}
 <ThemedModal
   isOpen={isModalOpen}
   onClose={() => setIsModalOpen(false)}
   title={editingShift ? 'Edit Shift' : 'Create New Shift'}
   size="2xl"
   className="max-h-[90vh] overflow-y-auto"
   footer={
     <div className="flex items-center gap-3 w-full">
       <ThemedButton variant="primary" onClick={handleSave} className="flex-1">
         {editingShift ? 'Save Changes' : 'Create Shift'}
       </ThemedButton>
       <ThemedButton variant="cancel" onClick={() => setIsModalOpen(false)} className="flex-1">
         Cancel
       </ThemedButton>
     </div>
   }
 >
   <div className="space-y-4">
     {/* Row 1: Shift Name, Shift Code, Scheduled Time */}
     <div className="grid grid-cols-3 gap-4">
       <ThemedInput
         label="Shift Name"
         type="text"
         value={shiftForm.shiftName || ''}
         onChange={e => setShiftForm({...shiftForm, shiftName: e.target.value})}
         placeholder="e.g. Morning Pickup"
       />
       <ThemedInput
         label="Shift Code"
         type="text"
         value={shiftForm.shiftCode || ''}
         onChange={e => setShiftForm({...shiftForm, shiftCode: e.target.value})}
         placeholder="e.g. AM-001"
       />
       <ThemedTimeInput
         label="Scheduled Time"
         value={shiftForm.scheduledTime || ''}
         onChange={e => setShiftForm({...shiftForm, scheduledTime: e.target.value})}
       />
     </div>

     {/* Row 2: School, Driver, Assigned Route */}
     <div className="grid grid-cols-3 gap-4">
       <ThemedInput
         label="School"
         type="text"
         value={shiftForm.school || ''}
         onChange={e => setShiftForm({...shiftForm, school: e.target.value})}
         placeholder="e.g. Greenwood Academy"
       />
       <ThemedInput
         label="Driver"
         type="text"
         value={shiftForm.drivers?.[0] || ''}
         onChange={e => setShiftForm({...shiftForm, drivers: [e.target.value]})}
         placeholder="Assign a driver"
       />
       <ThemedInput
         label="Assigned Route"
         type="text"
         value={shiftForm.assignedRoute || ''}
         onChange={e => setShiftForm({...shiftForm, assignedRoute: e.target.value})}
         placeholder="e.g. Route A - Westlands"
       />
     </div>

     {/* Row 3: Days (Multi-select) + Status (Toggle) */}
     <div className="grid grid-cols-2 gap-4">
       <div>
         <label className="block text-sm font-bold text-gray-600 mb-1">Days</label>
         <div className="flex flex-wrap gap-2 mt-2">
           {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
             <button
               key={day}
               type="button"
               onClick={() => toggleDay(day)}
               className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                 (shiftForm.days || []).includes(day)
                   ? 'text-white'
                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
               }`}
             >
               {day}
             </button>
           ))}
         </div>
       </div>

       <div>
         <label className="block text-sm font-bold text-gray-600 mb-1">Status</label>
         {currentUser?.role === UserRole.SUPER_ADMIN || currentUser?.role === UserRole.ADMIN ? (
           <div className="flex items-center gap-3 mt-2">
             <button
               type="button"
               onClick={() => setShiftForm({...shiftForm, status: 'ACTIVE'})}
               className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                 shiftForm.status === 'ACTIVE'
                   ? 'bg-green-500 text-white'
                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
               }`}
             >
               Active
             </button>
             <button
               type="button"
               onClick={() => setShiftForm({...shiftForm, status: 'INACTIVE'})}
               className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                 shiftForm.status === 'INACTIVE'
                   ? 'bg-red-500 text-white'
                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
               }`}
             >
               Suspended
             </button>
           </div>
         ) : (
           <div
             onClick={() => {
               if (shiftForm.status === 'INACTIVE') {
                 alert('Please contact your admin to unsuspend this shift.');
               }
             }}
             className="mt-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-default"
           >
             <span className={`text-sm font-bold ${shiftForm.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
               {shiftForm.status === 'ACTIVE' ? 'Active' : 'Suspended'}
             </span>
           </div>
         )}
       </div>
     </div>

     {/* Row 4: Notes (Conditional - shown when INACTIVE or for SUPER_ADMIN/ADMIN) */}
     {((currentUser?.role === UserRole.SUPER_ADMIN || currentUser?.role === UserRole.ADMIN) || shiftForm.status === 'INACTIVE') && (
       <ThemedTextarea
         label="Notes"
         value={shiftForm.notes || ''}
         onChange={e => setShiftForm({...shiftForm, notes: e.target.value})}
         rows={3}
         placeholder="Optional notes..."
       />
     )}
   </div>
 </ThemedModal>
 </div>
 );
};
