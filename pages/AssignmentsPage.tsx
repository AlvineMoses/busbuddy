import React, { useState } from 'react';
import { useTheme } from '../src/hooks/useTheme';
import { ThemedButton } from '../src/components/ThemedComponents';
import { Calendar, MapPin, Users, Plus, Edit2, Trash2, Search, Download, AlertCircle, CheckCircle } from 'lucide-react';
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
 <div className="bg-white rounded-[2.5rem] shadow-soft-xl border border-gray-100 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-gray-50 border-b border-gray-100">
 <tr>
 <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Route ID</th>
 <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Route Name</th>
 <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">School</th>
 <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Driver</th>
 <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
 <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Time</th>
 <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
 <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
 <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {filteredAssignments.map((assignment) => (
 <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
 <td className="px-8 py-5">
 <span className="font-mono text-sm text-gray-600">{assignment.routeId}</span>
 </td>
 <td className="px-8 py-5">
 <div>
 <p className="font-bold text-brand-black">{assignment.routeName}</p>
 {assignment.recurring && (
 <span className="inline-flex items-center gap-1 text-xs text-blue-600 mt-1">
 <Calendar size={12} />
 Recurring
 </span>
 )}
 </div>
 </td>
 <td className="px-8 py-5">
 <span className="text-sm text-gray-600">{assignment.school}</span>
 </td>
 <td className="px-8 py-5">
 <span className="text-sm text-gray-600">{assignment.driver}</span>
 </td>
 <td className="px-8 py-5">
 <span className="text-sm text-gray-600">{new Date(assignment.date).toLocaleDateString()}</span>
 </td>
 <td className="px-8 py-5">
 <span className="text-sm text-gray-600">{assignment.routeTime}</span>
 </td>
 <td className="px-8 py-5">
 <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getTypeBadge(assignment.routeType)}`}>
 {assignment.routeType.replace('_', ' ')}
 </span>
 </td>
 <td className="px-8 py-5">
 <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusBadge(assignment.status)}`}>
 {assignment.status}
 </span>
 </td>
 <td className="px-8 py-5">
 <div className="flex items-center gap-2">
 <ThemedButton variant="icon" onClick={() => openEditModal(assignment)}>
 <Edit2 size={16} />
 </ThemedButton>
 <ThemedButton variant="icon" onClick={() => handleDelete(assignment.id)} style={{ color: '#dc2626' }}>
 <Trash2 size={16} />
 </ThemedButton>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {filteredAssignments.length === 0 && (
 <div className="flex flex-col items-center justify-center py-16 text-gray-400">
 <MapPin size={48} className="mb-4 text-gray-300" />
 <p className="text-lg font-medium text-gray-600">No assignments found</p>
 <p className="text-sm">Try adjusting your filters or create a new assignment</p>
 </div>
 )}
 </div>

 {/* Add/Edit Assignment Modal */}
 {isModalOpen && (
 <div className="fixed inset-0 z-[70] isolate">
 <div className="absolute inset-0 bg-brand-black/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
 <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
 <div className="relative bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 pointer-events-auto max-h-[90vh] overflow-y-auto">
 <h2 className="text-2xl font-bold text-brand-black mb-6">{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</h2>

 <div className="space-y-4">
 <div>
 <label className="block text-sm font-bold text-gray-600 mb-1">Route Name</label>
 <input type="text" value={assignmentForm.routeName || ''} onChange={e => setAssignmentForm({...assignmentForm, routeName: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-/20 focus:border-" placeholder="e.g. Route A - North" />
 </div>
 <div>
 <label className="block text-sm font-bold text-gray-600 mb-1">School</label>
 <input type="text" value={assignmentForm.school || ''} onChange={e => setAssignmentForm({...assignmentForm, school: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-/20 focus:border-" placeholder="e.g. Greenfield Academy" />
 </div>
 <div>
 <label className="block text-sm font-bold text-gray-600 mb-1">Driver</label>
 <input type="text" value={assignmentForm.driver || ''} onChange={e => setAssignmentForm({...assignmentForm, driver: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-/20 focus:border-" placeholder="e.g. James Wilson" />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-bold text-gray-600 mb-1">Date</label>
 <input type="date" value={assignmentForm.date || ''} onChange={e => setAssignmentForm({...assignmentForm, date: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-/20 focus:border-" />
 </div>
 <div>
 <label className="block text-sm font-bold text-gray-600 mb-1">Route Time</label>
 <input type="time" value={assignmentForm.routeTime || ''} onChange={e => setAssignmentForm({...assignmentForm, routeTime: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-/20 focus:border-" />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-bold text-gray-600 mb-1">Route Type</label>
 <select value={assignmentForm.routeType || 'PICKUP'} onChange={e => setAssignmentForm({...assignmentForm, routeType: e.target.value as Assignment['routeType']})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-/20 focus:border-">
 <option value="PICKUP">Pickup</option>
 <option value="DROP_OFF">Drop Off</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-bold text-gray-600 mb-1">Status</label>
 <select value={assignmentForm.status || 'SCHEDULED'} onChange={e => setAssignmentForm({...assignmentForm, status: e.target.value as Assignment['status']})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-/20 focus:border-">
 <option value="SCHEDULED">Scheduled</option>
 <option value="COMPLETED">Completed</option>
 <option value="CANCELLED">Cancelled</option>
 </select>
 </div>
 </div>
 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
 <input type="checkbox" id="recurring" checked={assignmentForm.recurring || false} onChange={e => setAssignmentForm({...assignmentForm, recurring: e.target.checked})} className="w-4 h-4 text- rounded" />
 <label htmlFor="recurring" className="text-sm font-bold text-gray-600">Recurring Assignment</label>
 </div>
 </div>

 <div className="flex items-center gap-3 mt-6">
 <ThemedButton variant="primary" onClick={handleSave} className="flex-1">
 {editingAssignment ? 'Save Changes' : 'Create Assignment'}
 </ThemedButton>
 <ThemedButton variant="cancel" onClick={() => setIsModalOpen(false)} className="flex-1">
 Cancel
 </ThemedButton>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};
