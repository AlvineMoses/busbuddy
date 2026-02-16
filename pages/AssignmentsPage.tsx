import React, { useState } from 'react';
import { useTheme } from '../src/hooks/useTheme';
import { ThemedButton } from '../src/components/ThemedComponents';
import { ThemedModal } from '../src/components/ThemedModal';
import { ThemedInput, ThemedSelect, ThemedTimeInput } from '../src/components/ThemedFormField';
import { ThemedDataTable, TableColumn } from '../src/components/ThemedDataTable';
import { Calendar, MapPin, Plus, Edit2, Trash2, Search, Download } from 'lucide-react';
import { User } from '../types';

interface AssignmentsPageProps {
 currentUser?: User;
 showHeader?: boolean;
}

interface Assignment {
 id: string;
 routeId: string;
 routeName: string;
 school: string;
 driver: string;
 date: string;
 routeTime: string;
 routeType: 'PICKUP' | 'DROP_OFF';
 status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
 recurring?: boolean;
 conflicts?: string[];
}

const MOCK_ASSIGNMENTS: Assignment[] = [
 {
 id: 'ASG-001',
 routeId: 'RT-A',
 routeName: 'Route A - North',
 school: 'Greenfield Academy',
 driver: 'James Wilson',
 date: '2024-02-15',
 routeTime: '06:30 AM',
 routeType: 'PICKUP',
 status: 'SCHEDULED',
 recurring: true
 },
 {
 id: 'ASG-002',
 routeId: 'RT-B',
 routeName: 'Route B - South',
 school: 'Greenfield Academy',
 driver: 'Sarah Parker',
 date: '2024-02-15',
 routeTime: '03:30 PM',
 routeType: 'DROP_OFF',
 status: 'SCHEDULED'
 },
 {
 id: 'ASG-003',
 routeId: 'RT-C',
 routeName: 'City Route',
 school: 'Innovation High',
 driver: 'Michael Chen',
 date: '2024-02-14',
 routeTime: '07:00 AM',
 routeType: 'PICKUP',
 status: 'COMPLETED'
 }
];

export const AssignmentsPage: React.FC<AssignmentsPageProps> = ({ currentUser, showHeader = true }) => {
 const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
 const { colors } = useTheme();
 const [searchTerm, setSearchTerm] = useState('');
 const [selectedSchool, setSelectedSchool] = useState('');
 const [typeFilter, setTypeFilter] = useState('');
 const [dateFilter, setDateFilter] = useState('');
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
 const [assignmentForm, setAssignmentForm] = useState<Partial<Assignment>>({
 routeName: '', school: '', driver: '', date: '', routeTime: '', routeType: 'PICKUP', status: 'SCHEDULED', recurring: false
 });

 const filteredAssignments = assignments.filter(assignment => {
 const matchesSearch = assignment.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
 assignment.driver.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesSchool = !selectedSchool || assignment.school === selectedSchool;
 const matchesType = !typeFilter || assignment.routeType === typeFilter;
 const matchesDate = !dateFilter || assignment.date === dateFilter;
 return matchesSearch && matchesSchool && matchesType && matchesDate;
 });

 const openCreateModal = () => {
 setEditingAssignment(null);
 setAssignmentForm({ routeName: '', school: '', driver: '', date: '', routeTime: '', routeType: 'PICKUP', status: 'SCHEDULED', recurring: false });
 setIsModalOpen(true);
 };

 const openEditModal = (assignment: Assignment) => {
 setEditingAssignment(assignment);
 setAssignmentForm({ ...assignment });
 setIsModalOpen(true);
 };

 const handleDelete = (id: string) => {
 if (window.confirm('Are you sure you want to delete this assignment?')) {
 setAssignments(assignments.filter(a => a.id !== id));
 }
 };

 const handleSave = () => {
 if (!assignmentForm.routeName || !assignmentForm.driver) return;
 if (editingAssignment) {
 setAssignments(assignments.map(a => a.id === editingAssignment.id ? { ...a, ...assignmentForm } as Assignment : a));
 } else {
 const newAssignment: Assignment = {
 id: `ASG-${String(assignments.length + 1).padStart(3, '0')}`,
 routeId: `RT-${String(assignments.length + 1)}`,
 routeName: assignmentForm.routeName || '',
 school: assignmentForm.school || '',
 driver: assignmentForm.driver || '',
 date: assignmentForm.date || new Date().toISOString().split('T')[0],
 routeTime: assignmentForm.routeTime || '',
 routeType: assignmentForm.routeType || 'PICKUP',
 status: assignmentForm.status || 'SCHEDULED',
 recurring: assignmentForm.recurring,
 };
 setAssignments([...assignments, newAssignment]);
 }
 setIsModalOpen(false);
 };

 const getStatusBadge = (status: string) => {
 const colors = {
 SCHEDULED: 'bg-blue-50 text-blue-600 border-blue-100',
 COMPLETED: 'bg-green-50 text-green-600 border-green-100',
 CANCELLED: 'bg-red-50 text-red-600 border-red-100'
 };
 return colors[status as keyof typeof colors] || colors.SCHEDULED;
 };

 const getTypeBadge = (type: string) => {
 const colors = {
 PICKUP: 'bg-purple-50 text-purple-600 border-purple-100',
 DROP_OFF: 'bg-orange-50 text-orange-600 border-orange-100'
 };
 return colors[type as keyof typeof colors] || colors.PICKUP;
 };

 const columns: TableColumn<typeof filteredAssignments[0]>[] = [
  {
   header: 'Route ID',
   key: 'routeId',
   render: (a) => <span className="font-mono text-sm text-gray-600">{a.routeId}</span>,
  },
  {
   header: 'Route Name',
   key: 'routeName',
   render: (a) => (
    <div>
     <p className="font-bold text-brand-black">{a.routeName}</p>
     {a.recurring && (
      <span className="inline-flex items-center gap-1 text-xs text-blue-600 mt-1">
       <Calendar size={12} />
       Recurring
      </span>
     )}
    </div>
   ),
  },
  {
   header: 'School',
   key: 'school',
   render: (a) => <span className="text-sm text-gray-600">{a.school}</span>,
  },
  {
   header: 'Driver',
   key: 'driver',
   render: (a) => <span className="text-sm text-gray-600">{a.driver}</span>,
  },
  {
   header: 'Date',
   key: 'date',
   render: (a) => <span className="text-sm text-gray-600">{new Date(a.date).toLocaleDateString()}</span>,
  },
  {
   header: 'Time',
   key: 'time',
   render: (a) => <span className="text-sm text-gray-600">{a.routeTime}</span>,
  },
  {
   header: 'Type',
   key: 'type',
   render: (a) => (
    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getTypeBadge(a.routeType)}`}>
     {a.routeType.replace('_', ' ')}
    </span>
   ),
  },
  {
   header: 'Status',
   key: 'status',
   render: (a) => (
    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusBadge(a.status)}`}>
     {a.status}
    </span>
   ),
  },
 ];

 return (
 <div className="space-y-8 animate-in fade-in duration-700">
 
 {/* Header */}
 {showHeader && (
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
 <div>
 <h1 className="text-5xl font-medium text-brand-black tracking-tight mb-2">Assignments</h1>
 <p className="text-gray-500 font-normal text-xl">Manage route and driver bookings.</p>
 </div>
 <ThemedButton variant="primary" onClick={openCreateModal} icon={Plus}>
 Add Booking
 </ThemedButton>
 </div>
 )}

 {!showHeader && (
 <div className="flex items-center justify-end px-2">
 <ThemedButton variant="primary" onClick={openCreateModal} icon={Plus}>
 Add Booking
 </ThemedButton>
 </div>
 )}

 {/* Filters */}
 <div className="bg-white rounded-[2.5rem] p-8 shadow-soft-xl border border-gray-100">
 <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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

 {/* Type Filter */}
 <div>
 <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
 Type
 </label>
 <select
 value={typeFilter}
 onChange={(e) => setTypeFilter(e.target.value)}
 className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-black focus:ring-2 focus:ring-/20 outline-none transition-all"
 >
 <option value="">All Types</option>
 <option value="PICKUP">Pickup</option>
 <option value="DROP_OFF">Drop-off</option>
 </select>
 </div>

 {/* Date Filter */}
 <div>
 <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
 Date
 </label>
 <input
 type="date"
 value={dateFilter}
 onChange={(e) => setDateFilter(e.target.value)}
 className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-black focus:ring-2 focus:ring-/20 outline-none transition-all"
 />
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
 placeholder="Route, driver..."
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

 {/* Assignments Table */}
 <ThemedDataTable<Assignment>
  columns={columns}
  data={filteredAssignments}
  rowKey={(a) => a.id}
  renderActions={(a) => (
   <div className="flex items-center gap-2">
    <ThemedButton variant="icon" onClick={() => openEditModal(a)}>
     <Edit2 size={16} />
    </ThemedButton>
    <ThemedButton variant="icon" onClick={() => handleDelete(a.id)} style={{ color: '#dc2626' }}>
     <Trash2 size={16} />
    </ThemedButton>
   </div>
  )}
  actionsHeader="Actions"
  container
  emptyIcon={<MapPin size={48} className="text-gray-300" />}
  emptyTitle="No assignments found"
  emptySubtitle="Try adjusting your filters or create a new assignment"
 />

 {/* Add/Edit Assignment Modal */}
 <ThemedModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 title={editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
 size="lg"
 onConfirm={handleSave}
 confirmLabel={editingAssignment ? 'Save Changes' : 'Create Assignment'}
 >
 <div className="space-y-4">
 <ThemedInput label="Route Name" type="text" value={assignmentForm.routeName || ''} onChange={e => setAssignmentForm({...assignmentForm, routeName: e.target.value})} placeholder="e.g. Route A - North" />
 <ThemedInput label="School" type="text" value={assignmentForm.school || ''} onChange={e => setAssignmentForm({...assignmentForm, school: e.target.value})} placeholder="e.g. Greenfield Academy" />
 <ThemedInput label="Driver" type="text" value={assignmentForm.driver || ''} onChange={e => setAssignmentForm({...assignmentForm, driver: e.target.value})} placeholder="e.g. James Wilson" />
 <div className="grid grid-cols-2 gap-4">
 <ThemedInput label="Date" type="date" value={assignmentForm.date || ''} onChange={e => setAssignmentForm({...assignmentForm, date: e.target.value})} />
 <ThemedTimeInput label="Route Time" value={assignmentForm.routeTime || ''} onChange={e => setAssignmentForm({...assignmentForm, routeTime: e.target.value})} />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <ThemedSelect label="Route Type" value={assignmentForm.routeType || 'PICKUP'} onChange={e => setAssignmentForm({...assignmentForm, routeType: e.target.value as any})}>
 <option value="PICKUP">Pickup</option>
 <option value="DROP_OFF">Drop Off</option>
 </ThemedSelect>
 <ThemedSelect label="Status" value={assignmentForm.status || 'SCHEDULED'} onChange={e => setAssignmentForm({...assignmentForm, status: e.target.value as any})}>
 <option value="SCHEDULED">Scheduled</option>
 <option value="COMPLETED">Completed</option>
 <option value="CANCELLED">Cancelled</option>
 </ThemedSelect>
 </div>
 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
 <input type="checkbox" id="recurring" checked={assignmentForm.recurring || false} onChange={e => setAssignmentForm({...assignmentForm, recurring: e.target.checked})} className="w-4 h-4 rounded" />
 <label htmlFor="recurring" className="text-sm font-bold text-gray-600">Recurring Assignment</label>
 </div>
 </div>
 </ThemedModal>
 </div>
 );
};
