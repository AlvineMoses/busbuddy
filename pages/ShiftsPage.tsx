import React, { useState } from 'react';
import { useTheme } from '../src/hooks/useTheme';
import { ThemedButton } from '../src/components/ThemedComponents';
import { ThemedModal } from '../src/components/ThemedModal';
import { ThemedInput, ThemedSelect, ThemedTextarea, ThemedTimeInput } from '../src/components/ThemedFormField';
import { Calendar, Plus, Edit2, Copy, Trash2, Search, Download } from 'lucide-react';
import { User } from '../types';

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
 <div className="bg-white rounded-[2.5rem] shadow-soft-xl border border-gray-100 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-gray-50 border-b border-gray-100">
 <tr>
 <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Shift ID</th>
 <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Shift Name</th>
 <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Drivers</th>
 <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Days</th>
 <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Scheduled</th>
 <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actual</th>
 <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Route</th>
 <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
 <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {filteredShifts.map((shift) => (
 <tr key={shift.id} className="hover:bg-gray-50 transition-colors">
 <td className="px-8 py-5">
 <span className="font-mono text-sm text-gray-600">{shift.id}</span>
 </td>
 <td className="px-8 py-5">
 <div>
 <p className="font-bold text-brand-black">{shift.shiftName}</p>
 <p className="text-xs text-gray-400 font-mono">{shift.shiftCode}</p>
 </div>
 </td>
 <td className="px-8 py-5">
 <div className="flex flex-col gap-1">
 {shift.drivers.map((driver, idx) => (
 <span key={idx} className="text-sm text-gray-600">{driver}</span>
 ))}
 </div>
 </td>
 <td className="px-8 py-5">
 <div className="flex flex-wrap gap-1">
 {shift.days.map((day, idx) => (
 <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">
 {day}
 </span>
 ))}
 </div>
 </td>
 <td className="px-8 py-5">
 <span className="text-sm text-gray-600">{shift.scheduledTime}</span>
 </td>
 <td className="px-8 py-5">
 <span className="text-sm text-gray-600">{shift.actualTime || '-'}</span>
 </td>
 <td className="px-8 py-5">
 <span className="text-sm text-gray-600">{shift.assignedRoute}</span>
 </td>
 <td className="px-8 py-5">
 <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusBadge(shift.status)}`}>
 {shift.status}
 </span>
 </td>
 <td className="px-8 py-5">
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
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {filteredShifts.length === 0 && (
 <div className="flex flex-col items-center justify-center py-16 text-gray-400">
 <Calendar size={48} className="mb-4 text-gray-300" />
 <p className="text-lg font-medium text-gray-600">No shifts found</p>
 <p className="text-sm">Try adjusting your filters or create a new shift</p>
 </div>
 )}
 </div>

 {/* Add/Edit Shift Modal */}
 <ThemedModal
   isOpen={isModalOpen}
   onClose={() => setIsModalOpen(false)}
   title={editingShift ? 'Edit Shift' : 'Create New Shift'}
   size="lg"
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
     <ThemedInput
       label="Shift Name"
       type="text"
       value={shiftForm.shiftName || ''}
       onChange={e => setShiftForm({...shiftForm, shiftName: e.target.value})}
       placeholder="e.g. Morning Pickup"
     />

     <div className="grid grid-cols-2 gap-4">
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

     <ThemedInput
       label="School"
       type="text"
       value={shiftForm.school || ''}
       onChange={e => setShiftForm({...shiftForm, school: e.target.value})}
       placeholder="e.g. Greenwood Academy"
     />

     <ThemedInput
       label="Assigned Route"
       type="text"
       value={shiftForm.assignedRoute || ''}
       onChange={e => setShiftForm({...shiftForm, assignedRoute: e.target.value})}
       placeholder="e.g. Route A - Westlands"
     />

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

     <ThemedSelect
       label="Status"
       value={shiftForm.status || 'ACTIVE'}
       onChange={e => setShiftForm({...shiftForm, status: e.target.value as Shift['status']})}
     >
       <option value="ACTIVE">Active</option>
       <option value="INACTIVE">Inactive</option>
       <option value="PENDING">Pending</option>
     </ThemedSelect>

     <ThemedTextarea
       label="Notes"
       value={shiftForm.notes || ''}
       onChange={e => setShiftForm({...shiftForm, notes: e.target.value})}
       rows={3}
       placeholder="Optional notes..."
     />
   </div>
 </ThemedModal>
 </div>
 );
};
