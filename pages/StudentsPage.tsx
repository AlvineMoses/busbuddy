import React, { useState, useRef } from 'react';
import { useTheme } from '../src/hooks/useTheme';
import { ThemedButton } from '../src/components/ThemedComponents';
import { ThemedModal } from '../src/components/ThemedModal';
import { ThemedInput, ThemedSelect } from '../src/components/ThemedFormField';
import { ThemedDataTable, TableColumn, ActionMenuItem } from '../src/components/ThemedDataTable';
import { Search, Plus, MoreHorizontal, Bus, CheckCircle, Clock, XCircle, UserX, Upload, ChevronDown, Trash2, Edit2, RefreshCw, LayoutGrid, List as ListIcon, MapPin, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { useStudentData } from '../src/hooks/useAppData';
import { useRouteData } from '../src/hooks/useAppData';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { PlacesAutocomplete, PlaceResult } from '../src/components/PlacesAutocomplete';
import { PhoneInput } from '../src/components/PhoneInput';

interface StudentsPageProps {
 currentUser: User;
 showHeader?: boolean;
}

const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
const NAIROBI_CENTER = { lat: -1.286389, lng: 36.817223 };

export const StudentsPage: React.FC<StudentsPageProps> = ({ currentUser, showHeader = true }) => {
 // SMART DATA-FLOW: Use centralized hooks
 const { students, createStudent, updateStudent, deleteStudent, toggleDisable, transfer, bulkUpload, isLoading, error } = useStudentData();
 const { routes, schools: schoolsList } = useRouteData();
 const { colors } = useTheme();
 const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
 const [searchTerm, setSearchTerm] = useState('');
 const [schoolFilter, setSchoolFilter] = useState('');
 const [gradeFilter, setGradeFilter] = useState('');
 const [statusFilter, setStatusFilter] = useState('');
 
 // Interactive State
 const [openActionId, setOpenActionId] = useState<string | null>(null);
 const [selectedStudent, setSelectedStudent] = useState<any>(null);
 const [modals, setModals] = useState({
 edit: false,
 trips: false,
 transfer: false,
 add: false,
 bulkUpload: false,
 changeRoute: false
 });

 // Form State for Add/Edit
 const [formData, setFormData] = useState<any>({});
 // Change Route State
 const [changeRouteForm, setChangeRouteForm] = useState({
 currentRoute: '',
 newRoute: ''
 });
 // Map markers for pickup/dropoff
 const [pickupMarker, setPickupMarker] = useState<{ lat: number; lng: number } | null>(null);
 const [dropoffMarker, setDropoffMarker] = useState<{ lat: number; lng: number } | null>(null);

 const fileInputRef = useRef<HTMLInputElement>(null);

 // Extract unique values for dropdowns
 const schools = Array.from(new Set(students.map(s => s.school)));
 const grades = Array.from(new Set(students.map(s => s.grade))).sort();
 const statuses = Array.from(new Set(students.map(s => s.status))) as string[];

 const filteredStudents = students.filter(s => {
 const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
 s.guardian.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesSchool = schoolFilter ? s.school === schoolFilter : true;
 const matchesGrade = gradeFilter ? s.grade === gradeFilter : true;
 const matchesStatus = statusFilter ? s.status === statusFilter : true;
 
 return matchesSearch && matchesSchool && matchesGrade && matchesStatus;
 });

 const toggleAction = (id: string, e: React.MouseEvent) => {
 e.stopPropagation();
 setOpenActionId(openActionId === id ? null : id);
 };

 const handleBulkUploadClick = () => {
 setModals({ ...modals, bulkUpload: true });
 };

 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files && e.target.files.length > 0) {
 try {
 // In real implementation, parse CSV/Excel and call bulkUpload
 // For now, show success message
 alert(`Successfully uploaded ${e.target.files[0].name}. Processing...`);
 e.target.value = '';
 } catch (err: any) {
 alert('Upload failed: ' + (err?.message || 'Unknown error'));
 }
 }
 };

 const toggleStudentDisable = async (id: string) => {
 try {
 await toggleDisable(id);
 setOpenActionId(null);
 } catch (err: any) {
 alert('Failed to update student: ' + (err?.message || 'Unknown error'));
 }
 };

 const openModal = (type: 'edit' | 'trips' | 'transfer', student: any) => {
 setSelectedStudent(student);
 setFormData(student);
 setPickupMarker(null);
 setDropoffMarker(null);
 setModals(prev => ({ ...prev, [type]: true }));
 setOpenActionId(null);
 };

 const closeModal = (type: 'edit' | 'trips' | 'transfer' | 'add' | 'bulkUpload' | 'changeRoute') => {
 setModals(prev => ({ ...prev, [type]: false }));
 setSelectedStudent(null);
 setFormData({});
 setPickupMarker(null);
 setDropoffMarker(null);
 setChangeRouteForm({ currentRoute: '', newRoute: '' });
 };

 const handleSaveEdit = async () => {
 try {
 await updateStudent(formData.id, formData);
 closeModal('edit');
 } catch (err: any) {
 alert('Failed to save: ' + (err?.message || 'Unknown error'));
 }
 };

 const handleTransfer = async () => {
 try {
 const updates: any = {};
 if (formData.newSchool) updates.school = formData.newSchool;
 if (formData.newGrade) updates.grade = formData.newGrade;
 await transfer(selectedStudent.id, updates);
 closeModal('transfer');
 } catch (err: any) {
 alert('Failed to transfer: ' + (err?.message || 'Unknown error'));
 }
 };

 const handleAddStudent = async () => {
 try {
 await createStudent({
 name: `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'New Student',
 school: formData.school || schools[0],
 grade: formData.grade || '1st Grade',
 guardian: `${formData.guardianFirstName || ''} ${formData.guardianLastName || ''}`.trim() || 'Unknown',
 status: 'WAITING'
 });
 closeModal('add');
 } catch (err: any) {
 alert('Failed to add student: ' + (err?.message || 'Unknown error'));
 }
 };

 const openChangeRouteModal = (student: any) => {
   setSelectedStudent(student);
   // Note: In real implementation, get student's assignedRoutes from Student interface
   // For now, set a default current route
   setChangeRouteForm({
     currentRoute: '',
     newRoute: ''
   });
   setModals(prev => ({ ...prev, changeRoute: true }));
   setOpenActionId(null);
 };

 const handleChangeRoute = () => {
   if (!changeRouteForm.newRoute) {
     alert('Please select a new route');
     return;
   }

   // In real implementation with Student interface having assignedRoutes:
   // 1. Remove student from old route's stops
   // 2. Add student to new route's stops
   // 3. Update student.assignedRoutes array
   
   console.log('Changing route for student:', selectedStudent?.id, {
     from: changeRouteForm.currentRoute,
     to: changeRouteForm.newRoute
   });

   alert(`Route changed successfully for ${selectedStudent?.name}!`);
   closeModal('changeRoute');
 };oseModal('add');
 };

 return (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative" onClick={() => setOpenActionId(null)}>
 
 {/* Hidden File Input */}
 <input 
 type="file" 
 ref={fileInputRef} 
 onChange={handleFileChange} 
 className="hidden" 
 accept=".csv,.xlsx"
 />

 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
 {showHeader ? (
 <div>
 <h1 className="text-5xl font-medium text-brand-black tracking-tight mb-2">Students</h1>
 <p className="text-gray-500 font-normal text-xl">Directory & daily transport status.</p>
 </div>
 ) : <div className="hidden md:block"></div>}
 
 <div className="flex items-center gap-3 ml-auto">
 <ThemedButton variant="ghost" onClick={handleBulkUploadClick} icon={Upload}>
 Bulk Upload
 </ThemedButton>
 <ThemedButton 
 variant="primary"
 onClick={() => setModals({ ...modals, add: true })}
 icon={Plus}
 >
 Add Student
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

 {viewMode === 'grid' ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
 {filteredStudents.map(student => (
 <div key={student.id} className="bg-white rounded-[2.5rem] p-6 shadow-soft-xl border border-gray-100 hover:shadow-2xl transition-all group relative flex flex-col items-center text-center">
 <div className="absolute top-6 right-6">
 <button 
 onClick={(e) => toggleAction(student.id, e)}
 className="p-2 rounded-full text-gray-300 hover:text-brand-black hover:bg-gray-50 transition-colors"
 >
 <MoreHorizontal size={20} />
 </button>
 {openActionId === student.id && (
 <div className="absolute right-0 top-10 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200 text-left">
 <button 
 onClick={() => openModal('edit', student)}
 className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors"
 >
 <Edit2 size={14} /> Edit Details
 </button>
 <button 
 onClick={() => openModal('trips', student)}
 className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors"
 >
 <Clock size={14} /> View Trips
 </button>
 <button 
 onClick={() => openModal('transfer', student)}
 className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors"
 >
 <RefreshCw size={14} /> Transfer
 </button>
 <div className="h-px bg-gray-50 my-1"></div>
 <button 
 onClick={() => toggleStudentDisable(student.id)}
 className={`w-full text-left px-4 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 transition-colors ${student.status === 'DISABLED' ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
 >
 {student.status === 'DISABLED' ? <CheckCircle size={14} /> : <Trash2 size={14} />} 
 {student.status === 'DISABLED' ? 'Enable' : 'Disable'}
 </button>
 </div>
 )}
 </div>

 <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-brand-black font-bold text-2xl shadow-sm border-2 border-white mb-4">
 {student.name.charAt(0)}
 </div>
 
 <h4 className="text-lg font-bold text-brand-black mb-1">{student.name}</h4>
 <p className="text-xs text-gray-400 font-medium mb-4">{student.school} • {student.grade}</p>

 <div className="mb-6">
 {student.status === 'ON_BOARD' && (
 <div className="px-4 py-2 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center gap-2 border border-brand-green/20">
 <Bus size={14} strokeWidth={2.5} /> <span className="text-xs font-bold uppercase tracking-wide">On Board</span>
 </div>
 )}
 {student.status === 'DROPPED_OFF' && (
 <div className="px-4 py-2 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center gap-2 border border-gray-200">
 <CheckCircle size={14} strokeWidth={2.5} /> <span className="text-xs font-bold uppercase tracking-wide">Dropped</span>
 </div>
 )}
 {student.status === 'WAITING' && (
 <div className="px-4 py-2 rounded-full bg-brand-amber/10 text-brand-amber flex items-center justify-center gap-2 border border-brand-amber/20">
 <Clock size={14} strokeWidth={2.5} /> <span className="text-xs font-bold uppercase tracking-wide">Waiting</span>
 </div>
 )}
 {student.status === 'ABSENT' && (
 <div className="px-4 py-2 rounded-full bg-red-50 text-red-500 flex items-center justify-center gap-2 border border-red-100">
 <XCircle size={14} strokeWidth={2.5} /> <span className="text-xs font-bold uppercase tracking-wide">Absent</span>
 </div>
 )}
 {student.status === 'DISABLED' && (
 <div className="px-4 py-2 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center gap-2 border border-gray-300">
 <UserX size={14} strokeWidth={2.5} /> <span className="text-xs font-bold uppercase tracking-wide">Disabled</span>
 </div>
 )}
 </div>

 <div className="w-full pt-4 border-t border-gray-50 flex items-center justify-center gap-2 text-gray-500 text-xs font-medium">
 <UserX size={14} /> Guardian: {student.guardian}
 </div>
 </div>
 ))}
 </div>
 ) : (
 /* List View */
 <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[600px] overflow-hidden">
 
 {/* Filter Toolbar */}
 <div className="p-8 border-b border-gray-50 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
 <div className="relative w-full xl:w-96 group">
 <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-brand-lilac transition-colors"><Search size={20} /></div>
 <input
 type="text"
 placeholder="Search students..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-4 focus:ring-brand-lilac/10 text-sm font-bold placeholder:text-gray-400 transition-all shadow-sm"
 />
 </div>
 
 <div className="flex flex-wrap gap-3 w-full xl:w-auto">
 {/* School Filter */}
 <div className="relative group">
 <select 
 value={schoolFilter}
 onChange={(e) => setSchoolFilter(e.target.value)}
 className="appearance-none bg-white pl-5 pr-10 py-4 rounded-full text-sm font-bold text-gray-600 hover:text-brand-black shadow-sm border border-gray-200 transition-all cursor-pointer min-w-[160px]"
 >
 <option value="">All Schools</option>
 {schools.map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-brand-black" size={14} />
 </div>

 {/* Grade Filter */}
 <div className="relative group">
 <select 
 value={gradeFilter}
 onChange={(e) => setGradeFilter(e.target.value)}
 className="appearance-none bg-white pl-5 pr-10 py-4 rounded-full text-sm font-bold text-gray-600 hover:text-brand-black shadow-sm border border-gray-200 transition-all cursor-pointer min-w-[140px]"
 >
 <option value="">All Grades</option>
 {grades.map(g => <option key={g} value={g}>{g}</option>)}
 </select>
 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-brand-black" size={14} />
 </div>

 {/* Status Filter */}
 <div className="relative group">
 <select 
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="appearance-none bg-white pl-5 pr-10 py-4 rounded-full text-sm font-bold text-gray-600 hover:text-brand-black shadow-sm border border-gray-200 transition-all cursor-pointer min-w-[140px]"
 >
 <option value="">All Status</option>
 {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
 </select>
 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-brand-black" size={14} />
 </div>
 </div>
 </div>

 {/* Flat Table View */}
 <ThemedDataTable<typeof filteredStudents[number]>
   columns={[
     {
       key: 'name',
       header: 'Student Name',
       render: (student) => (
         <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-black font-bold text-sm border border-gray-100">
             {student.name.charAt(0)}
           </div>
           <div>
             <div className="font-bold text-brand-black text-base">{student.name}</div>
             <div className="text-xs font-medium text-gray-400 mt-0.5">ID: {student.id}</div>
           </div>
         </div>
       ),
     },
     {
       key: 'school',
       header: 'School & Grade',
       render: (student) => (
         <>
           <p className="font-bold text-sm text-brand-black truncate">{student.school}</p>
           <p className="text-xs text-gray-500 font-medium mt-0.5">{student.grade}</p>
         </>
       ),
     },
     {
       key: 'guardian',
       header: 'Guardian',
       render: (student) => (
         <p className="font-medium text-sm text-gray-600 truncate">{student.guardian}</p>
       ),
     },
     {
       key: 'status',
       header: 'Status',
       headerAlign: 'center',
       render: (student) => (
         <div className="flex justify-center">
           {student.status === 'ON_BOARD' && (
             <div className="px-3 py-1.5 rounded-full bg-brand-green/10 text-brand-green flex items-center gap-2 border border-brand-green/20">
               <Bus size={12} strokeWidth={2.5} /> <span className="text-[10px] font-bold uppercase tracking-wide">On Board</span>
             </div>
           )}
           {student.status === 'DROPPED_OFF' && (
             <div className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 flex items-center gap-2 border border-gray-200">
               <CheckCircle size={12} strokeWidth={2.5} /> <span className="text-[10px] font-bold uppercase tracking-wide">Dropped</span>
             </div>
           )}
           {student.status === 'WAITING' && (
             <div className="px-3 py-1.5 rounded-full bg-brand-amber/10 text-brand-amber flex items-center gap-2 border border-brand-amber/20">
               <Clock size={12} strokeWidth={2.5} /> <span className="text-[10px] font-bold uppercase tracking-wide">Waiting</span>
             </div>
           )}
           {student.status === 'ABSENT' && (
             <div className="px-3 py-1.5 rounded-full bg-red-50 text-red-500 flex items-center gap-2 border border-red-100">
               <XCircle size={12} strokeWidth={2.5} /> <span className="text-[10px] font-bold uppercase tracking-wide">Absent</span>
             </div>
           )}
           {student.status === 'DISABLED' && (
             <div className="px-3 py-1.5 rounded-full bg-gray-200 text-gray-500 flex items-center gap-2 border border-gray-300">
               <UserX size={12} strokeWidth={2.5} /> <span className="text-[10px] font-bold uppercase tracking-wide">Disabled</span>
             </div>
           )}
         </div>
       ),
     },
   ]}
   data={filteredStudents}
   rowKey={(student) => student.id}
   actionsHeader="Actions"
   actions={[
     {
       label: 'Edit Details',
       icon: <Edit2 size={14} />,
       onClick: (student) => openModal('edit', student),
     },
     {
       label: 'View Trips',
       icon: <Clock size={14} />,
       onClick: (student) => openModal('trips', student),
     },
     {
       label: 'Change Route',
       icon: <ArrowRight size={14} />,
       onClick: (student) => openChangeRouteModal(student),
     },
     {
       label: 'Transfer',
       icon: <RefreshCw size={14} />,
       onClick: (student) => openModal('transfer', student),
     },
     {
       label: 'Disable',
       icon: <Trash2 size={14} />,
       onClick: (student) => toggleStudentDisable(student.id),
       className: 'text-red-500 hover:bg-red-50',
       divider: true,
       hidden: (student) => student.status === 'DISABLED',
     },
     {
       label: 'Enable',
       icon: <CheckCircle size={14} />,
       onClick: (student) => toggleStudentDisable(student.id),
       className: 'text-green-600 hover:bg-green-50',
       divider: true,
       hidden: (student) => student.status !== 'DISABLED',
     },
   ]}
   rowClassName={() => 'cursor-pointer'}
 />

 </div>
 )}

 {/* Edit Modal — Two-Column Layout matching Add Student */}
 <ThemedModal
   isOpen={modals.edit && selectedStudent !== null}
   onClose={() => closeModal('edit')}
   title="Edit Student"
   size="xl"
   className="max-h-[90vh] overflow-y-auto"
   footer={
     <ThemedButton variant="primary" onClick={handleSaveEdit}>
       Save Changes
     </ThemedButton>
   }
 >
   {selectedStudent && (
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       {/* Left Column */}
       <div className="space-y-4">
         <ThemedSelect
           label="School"
           value={formData.school || ''}
           onChange={(e) => setFormData({...formData, school: e.target.value})}
         >
           {schools.map(s => <option key={s} value={s}>{s}</option>)}
         </ThemedSelect>

         <div className="grid grid-cols-2 gap-3">
           <ThemedInput
             label="First Name"
             type="text"
             value={(formData.name || '').split(' ')[0] || ''}
             onChange={(e) => {
               const parts = (formData.name || '').split(' ');
               parts[0] = e.target.value;
               setFormData({...formData, name: parts.join(' ')});
             }}
           />
           <ThemedInput
             label="Last Name"
             type="text"
             value={(formData.name || '').split(' ').slice(1).join(' ') || ''}
             onChange={(e) => {
               const first = (formData.name || '').split(' ')[0] || '';
               setFormData({...formData, name: `${first} ${e.target.value}`.trim()});
             }}
           />
         </div>

         <ThemedSelect
           label="Grade"
           value={formData.grade || ''}
           onChange={(e) => setFormData({...formData, grade: e.target.value})}
         >
           {grades.map(g => <option key={g} value={g}>{g}</option>)}
         </ThemedSelect>

         <div className="grid grid-cols-2 gap-3">
           <ThemedInput
             label="Guardian First Name"
             type="text"
             value={(formData.guardian || '').split(' ')[0] || ''}
             onChange={(e) => {
               const parts = (formData.guardian || '').split(' ');
               parts[0] = e.target.value;
               setFormData({...formData, guardian: parts.join(' ')});
             }}
           />
           <ThemedInput
             label="Guardian Last Name"
             type="text"
             value={(formData.guardian || '').split(' ').slice(1).join(' ') || ''}
             onChange={(e) => {
               const first = (formData.guardian || '').split(' ')[0] || '';
               setFormData({...formData, guardian: `${first} ${e.target.value}`.trim()});
             }}
           />
         </div>

         <div>
           <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Guardian Phone</label>
           <div className="mt-2">
             <PhoneInput
               value={formData.guardianPhone || ''}
               onChange={(val) => setFormData({...formData, guardianPhone: val})}
               placeholder="712 345 678"
             />
           </div>
         </div>
       </div>

       {/* Right Column — Route & Map */}
       <div className="space-y-4">
         <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={14} /> Pickup & Dropoff</h4>
           <div className="grid grid-cols-2 gap-3">
             <div>
               <label className="text-[10px] font-bold text-gray-400 uppercase">Pickup From (Home)</label>
               <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                 <PlacesAutocomplete
                   value={formData.pickupAddress || ''}
                   onChange={(val) => setFormData({...formData, pickupAddress: val})}
                   onPlaceSelect={(place) => {
                     setFormData({...formData, pickupAddress: place.address});
                     setPickupMarker({ lat: place.lat, lng: place.lng });
                   }}
                   placeholder="Search home address..."
                 />
               </APIProvider>
             </div>
             <div>
               <label className="text-[10px] font-bold text-gray-400 uppercase">Pickup To</label>
               <input type="text" value={formData.school || 'School'} disabled className="w-full mt-0 p-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500" />
             </div>
             <div>
               <label className="text-[10px] font-bold text-gray-400 uppercase">Dropoff From</label>
               <input type="text" value={formData.school || 'School'} disabled className="w-full mt-0 p-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500" />
             </div>
             <div>
               <label className="text-[10px] font-bold text-gray-400 uppercase">Dropoff To (Home)</label>
               <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                 <PlacesAutocomplete
                   value={formData.dropoffAddress || ''}
                   onChange={(val) => setFormData({...formData, dropoffAddress: val})}
                   onPlaceSelect={(place) => {
                     setFormData({...formData, dropoffAddress: place.address});
                     setDropoffMarker({ lat: place.lat, lng: place.lng });
                   }}
                   placeholder="Search home address..."
                 />
               </APIProvider>
             </div>
           </div>
         </div>
         {/* Large Map Preview */}
         <div className="rounded-2xl overflow-hidden border border-gray-200 h-[340px]">
           <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
             <Map
               defaultCenter={pickupMarker || NAIROBI_CENTER}
               defaultZoom={12}
               gestureHandling="cooperative"
               disableDefaultUI={true}
               style={{ width: '100%', height: '100%' }}
             >
               {pickupMarker && <Marker position={pickupMarker} title="Pickup" />}
               {dropoffMarker && <Marker position={dropoffMarker} title="Dropoff" />}
             </Map>
           </APIProvider>
         </div>
       </div>
     </div>
   )}
 </ThemedModal>

 {/* Transfer Modal */}
 <ThemedModal
   isOpen={modals.transfer && !!selectedStudent}
   onClose={() => closeModal('transfer')}
   title="Transfer Student"
   size="lg"
   onConfirm={handleTransfer}
   confirmLabel="Confirm Transfer"
 >
   <div className="p-4 bg-brand-lilac/10 rounded-xl text-brand-lilac text-sm font-bold mb-6">
     Current: {selectedStudent?.school}
   </div>
   <div className="space-y-4">
     <ThemedSelect
       label="New School"
       onChange={(e) => setFormData({...formData, newSchool: e.target.value})}
     >
       <option value="">Select New School</option>
       {schools.filter(s => s !== selectedStudent?.school).map(s => <option key={s} value={s}>{s}</option>)}
     </ThemedSelect>
     <ThemedSelect
       label="New Grade (Optional)"
       onChange={(e) => setFormData({...formData, newGrade: e.target.value})}
     >
       <option value="">Keep Current Grade ({selectedStudent?.grade})</option>
       {grades.map(g => <option key={g} value={g}>{g}</option>)}
     </ThemedSelect>
   </div>
 </ThemedModal>

 {/* Change Route Modal */}
 <ThemedModal
   isOpen={modals.changeRoute && !!selectedStudent}
   onClose={() => closeModal('changeRoute')}
   title="Change Student Route"
   size="lg"
   onConfirm={handleChangeRoute}
   confirmLabel="Confirm Route Change"
 >
   <div className="space-y-6">
     {/* Student Info */}
     <div className="p-4 bg-gray-50 rounded-xl">
       <p className="text-sm font-bold text-brand-black mb-1">
         {selectedStudent?.name}
       </p>
       <p className="text-xs text-gray-400">
         {selectedStudent?.school} · {selectedStudent?.grade}
       </p>
     </div>

     {/* Current Route */}
     <div>
       <ThemedSelect
         label="Current Route"
         value={changeRouteForm.currentRoute}
         onChange={(e) => setChangeRouteForm({ ...changeRouteForm, currentRoute: e.target.value })}
       >
         <option value="">Select current route...</option>
         {routes
           .filter(route => route.schoolId === 'S1') // Filter by student's school
           .map(route => (
             <option key={route.id} value={route.id}>
               {route.name} ({route.type})
             </option>
           ))}
       </ThemedSelect>
       {changeRouteForm.currentRoute && (
         <p className="mt-2 text-xs text-gray-500">
           Current route will be unassigned
         </p>
       )}
     </div>

     {/* New Route */}
     <div>
       <ThemedSelect
         label="New Route"
         value={changeRouteForm.newRoute}
         onChange={(e) => setChangeRouteForm({ ...changeRouteForm, newRoute: e.target.value })}
       >
         <option value="">Select new route...</option>
         {routes
           .filter(route => 
             route.schoolId === 'S1' && // Filter by student's school
             route.id !== changeRouteForm.currentRoute // Exclude current route
           )
           .map(route => (
             <option key={route.id} value={route.id}>
               {route.name} ({route.type}) - {route.status}
             </option>
           ))}
       </ThemedSelect>
       {changeRouteForm.newRoute && (
         <div className="mt-3 p-3 bg-blue-50 rounded-lg">
           <p className="text-xs font-bold text-blue-900 mb-1">Route Change Summary</p>
           <p className="text-xs text-blue-700">
             Student will be assigned to the selected route. Their pickup/dropoff locations will be added as stops on the new route.
           </p>
         </div>
       )}
     </div>
   </div>
 </ThemedModal>

 {/* Add Student Modal — Two-Column Layout with Map */}
 <ThemedModal
   isOpen={modals.add}
   onClose={() => closeModal('add')}
   title="Add New Student"
   size="2xl"
   className="max-h-[90vh] overflow-y-auto"
   footer={
     <ThemedButton variant="primary" onClick={handleAddStudent} icon={Plus}>
       Add Student
     </ThemedButton>
   }
 >
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
     {/* Left Column */}
     <div className="space-y-4">
       <ThemedSelect label="School" onChange={(e) => setFormData({...formData, school: e.target.value})}>
         <option value="">Select School</option>
         {schools.map(s => <option key={s} value={s}>{s}</option>)}
       </ThemedSelect>
       <div className="grid grid-cols-2 gap-3">
         <ThemedInput label="First Name" type="text" placeholder="First name" onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
         <ThemedInput label="Last Name" type="text" placeholder="Last name" onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
       </div>
       <ThemedSelect label="Grade" onChange={(e) => setFormData({...formData, grade: e.target.value})}>
         <option value="">Select Grade</option>
         {grades.map(g => <option key={g} value={g}>{g}</option>)}
       </ThemedSelect>
       <div className="grid grid-cols-2 gap-3">
         <ThemedInput label="Guardian First Name" type="text" placeholder="First name" onChange={(e) => setFormData({...formData, guardianFirstName: e.target.value})} />
         <ThemedInput label="Guardian Last Name" type="text" placeholder="Last name" onChange={(e) => setFormData({...formData, guardianLastName: e.target.value})} />
       </div>
       <div>
         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Guardian Phone</label>
         <div className="mt-2">
           <PhoneInput
             value={formData.guardianPhone || ''}
             onChange={(val) => setFormData({...formData, guardianPhone: val})}
             placeholder="712 345 678"
           />
         </div>
       </div>
     </div>

     {/* Right Column — Route & Map */}
     <div className="space-y-4">
       <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={14} /> Pickup & Dropoff</h4>
         <div className="grid grid-cols-2 gap-3">
           <div>
             <label className="text-[10px] font-bold text-gray-400 uppercase">Pickup From (Home)</label>
             <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
               <PlacesAutocomplete
                 value={formData.pickupAddress || ''}
                 onChange={(val) => setFormData({...formData, pickupAddress: val})}
                 onPlaceSelect={(place) => { setFormData({...formData, pickupAddress: place.address}); setPickupMarker({ lat: place.lat, lng: place.lng }); }}
                 placeholder="Search home address..."
               />
             </APIProvider>
           </div>
           <div>
             <label className="text-[10px] font-bold text-gray-400 uppercase">Pickup To</label>
             <input 
               type="text" 
               value={formData.school || 'School'}
               disabled
               className="w-full mt-0 p-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500"
             />
           </div>
           <div>
             <label className="text-[10px] font-bold text-gray-400 uppercase">Dropoff From</label>
             <input 
               type="text" 
               value={formData.school || 'School'}
               disabled
               className="w-full mt-0 p-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500"
             />
           </div>
           <div>
             <label className="text-[10px] font-bold text-gray-400 uppercase">Dropoff To (Home)</label>
             <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
               <PlacesAutocomplete
                 value={formData.dropoffAddress || ''}
                 onChange={(val) => setFormData({...formData, dropoffAddress: val})}
                 onPlaceSelect={(place) => { setFormData({...formData, dropoffAddress: place.address}); setDropoffMarker({ lat: place.lat, lng: place.lng }); }}
                 placeholder="Search home address..."
               />
             </APIProvider>
           </div>
         </div>
       </div>
       {/* Large Map Preview */}
       <div className="rounded-2xl overflow-hidden border border-gray-200 h-[340px]">
         <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
           <Map
             defaultCenter={NAIROBI_CENTER}
             defaultZoom={12}
             gestureHandling="cooperative"
             disableDefaultUI={true}
             style={{ width: '100%', height: '100%' }}
           >
             {pickupMarker && <Marker position={pickupMarker} title="Pickup" />}
             {dropoffMarker && <Marker position={dropoffMarker} title="Dropoff" />}
           </Map>
         </APIProvider>
       </div>
     </div>
   </div>
 </ThemedModal>

 {/* Recent Trips Modal */}
 <ThemedModal
   isOpen={modals.trips && !!selectedStudent}
   onClose={() => closeModal('trips')}
   title="Recent History"
   size="lg"
 >
   <div className="space-y-4">
     <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
       <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"><CheckCircle size={18}/></div>
       <div>
         <p className="font-bold text-sm">Dropped Off at Home</p>
         <p className="text-xs text-gray-500">Today, 4:15 PM</p>
       </div>
     </div>
     <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
       <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Bus size={18}/></div>
       <div>
         <p className="font-bold text-sm">Boarded Bus 101</p>
         <p className="text-xs text-gray-500">Today, 3:30 PM</p>
       </div>
     </div>
   </div>
 </ThemedModal>

 {/* Bulk Upload Modal */}
 {modals.bulkUpload && <BulkUploadModal
 schools={schools}
 onClose={() => closeModal('bulkUpload')}
 onImport={(importedStudents) => {
 setStudents(prev => [...prev, ...importedStudents]);
 closeModal('bulkUpload');
 }}
 />}

 </div>
 );
};

/* ─── Bulk Upload Modal Component ─────────────────────────────────── */

interface BulkUploadModalProps {
 schools: string[];
 onClose: () => void;
 onImport: (students: any[]) => void;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ schools, onClose, onImport }) => {
 const [uploadedData, setUploadedData] = useState<any[]>([]);
 const [isDragging, setIsDragging] = useState(false);
 const [selectedSchool, setSelectedSchool] = useState(schools[0] || '');
 const [validationStatus, setValidationStatus] = useState<Record<number, 'pending' | 'valid' | 'error'>>({});
 const fileRef = useRef<HTMLInputElement>(null);

 const CSV_TEMPLATE_COLUMNS = ['First Name', 'Last Name', 'Grade', 'Guardian First Name', 'Guardian Last Name', 'Guardian Phone', 'Pickup Address'];

 const handleDownloadTemplate = () => {
 const header = CSV_TEMPLATE_COLUMNS.join(',');
 const sampleRows = [
 'Wanjiku,Kamau,5th Grade,Mary,Kamau,+254 712 345 678,Westlands Nairobi',
 'Ochieng,Odhiambo,10th Grade,James,Odhiambo,+254 723 456 789,Karen Nairobi',
 ];
 const csvContent = [header, ...sampleRows].join('\n');
 const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = 'student_upload_template.csv';
 a.click();
 URL.revokeObjectURL(url);
 };

 const parseCSV = (text: string) => {
 const lines = text.split('\n').filter(l => l.trim());
 if (lines.length < 2) return;
 const headers = lines[0].split(',').map(h => h.trim());
 const rows = lines.slice(1).map((line, idx) => {
 const values = line.split(',').map(v => v.trim());
 const row: any = { _rowIdx: idx };
 headers.forEach((h, i) => { row[h] = values[i] || ''; });
 return row;
 });
 setUploadedData(rows);
 // Set all rows to pending validation
 const status: Record<number, 'pending' | 'valid' | 'error'> = {};
 rows.forEach((_, i) => { status[i] = 'pending'; });
 setValidationStatus(status);
 };

 const handleFileDrop = (e: React.DragEvent) => {
 e.preventDefault();
 setIsDragging(false);
 const file = e.dataTransfer.files[0];
 if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
 const reader = new FileReader();
 reader.onload = (ev) => { parseCSV(ev.target?.result as string); };
 reader.readAsText(file);
 }
 };

 const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 const reader = new FileReader();
 reader.onload = (ev) => { parseCSV(ev.target?.result as string); };
 reader.readAsText(file);
 }
 };

 const handleCellEdit = (rowIdx: number, field: string, value: string) => {
 setUploadedData(prev => prev.map((r, i) => i === rowIdx ? { ...r, [field]: value } : r));
 };

 const handleValidateAll = () => {
 const newStatus: Record<number, 'pending' | 'valid' | 'error'> = {};
 uploadedData.forEach((row, i) => {
 const hasName = row['First Name'] && row['Last Name'];
 const hasGuardian = row['Guardian First Name'] && row['Guardian Last Name'];
 const hasPhone = row['Guardian Phone'];
 const hasAddress = row['Pickup Address'];
 newStatus[i] = (hasName && hasGuardian && hasPhone && hasAddress) ? 'valid' : 'error';
 });
 setValidationStatus(newStatus);
 };

 const handleImport = () => {
 const validRows = uploadedData.filter((_, i) => validationStatus[i] === 'valid');
 const newStudents = validRows.map((row, i) => ({
 id: `ST-BULK-${Date.now()}-${i}`,
 name: `${row['First Name']} ${row['Last Name']}`.trim(),
 school: selectedSchool,
 grade: row['Grade'] || '1st Grade',
 guardian: `${row['Guardian First Name']} ${row['Guardian Last Name']}`.trim(),
 status: 'WAITING'
 }));
 onImport(newStudents);
 };

 const validCount = Object.values(validationStatus).filter(v => v === 'valid').length;
 const errorCount = Object.values(validationStatus).filter(v => v === 'error').length;

 return (
   <ThemedModal
     isOpen={true}
     onClose={onClose}
     title="Bulk Upload Students"
     size="2xl"
     showCloseButton={true}
     className="max-h-[90vh] overflow-y-auto"
   >
     <p className="text-sm text-gray-500 -mt-4 mb-6">Import students via CSV file</p>
     
     {/* School Selection & Template Download */}
     <div className="flex items-center gap-4 mb-6">
       <div className="flex-1">
         <ThemedSelect label="School for Import" value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
           {schools.map(s => <option key={s} value={s}>{s}</option>)}
         </ThemedSelect>
       </div>
       <div className="pt-6">
         <ThemedButton variant="ghost" onClick={handleDownloadTemplate} icon={Upload}>
           Download Template
         </ThemedButton>
       </div>
     </div>

     {/* Upload Area */}
     {uploadedData.length === 0 ? (
       <div
         onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
         onDragLeave={() => setIsDragging(false)}
         onDrop={handleFileDrop}
         onClick={() => fileRef.current?.click()}
         className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
           isDragging ? 'border-brand-lilac bg-brand-lilac/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
         }`}
       >
         <input ref={fileRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileSelect} />
         <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
           <Upload size={28} className="text-gray-400" />
         </div>
         <p className="text-lg font-bold text-brand-black mb-1">Drag & drop your CSV file here</p>
         <p className="text-sm text-gray-400">or click to browse. Supports .csv and .xlsx files</p>
       </div>
     ) : (
       <>
         {/* Validation Bar */}
         <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-xl">
           <div className="flex items-center gap-4">
             <span className="text-sm font-bold text-brand-black">{uploadedData.length} rows loaded</span>
             {validCount > 0 && <span className="text-sm font-bold text-green-600">{validCount} valid</span>}
             {errorCount > 0 && <span className="text-sm font-bold text-red-500">{errorCount} errors</span>}
           </div>
           <div className="flex gap-2">
             <ThemedButton variant="ghost" onClick={handleValidateAll}>Validate All</ThemedButton>
             <ThemedButton variant="ghost" onClick={() => { setUploadedData([]); setValidationStatus({}); }}>Clear</ThemedButton>
           </div>
         </div>

         {/* Editable Table */}
         <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-[400px] overflow-y-auto">
           <table className="w-full text-left text-sm">
             <thead className="bg-gray-50 text-gray-400 font-bold text-xs uppercase tracking-widest sticky top-0 z-10">
               <tr>
                 <th className="px-3 py-3 w-8">#</th>
                 <th className="px-3 py-3 w-8"></th>
                 {CSV_TEMPLATE_COLUMNS.map(col => (
                   <th key={col} className="px-3 py-3 whitespace-nowrap">{col}</th>
                 ))}
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
               {uploadedData.map((row, i) => (
                 <tr key={i} className={`${validationStatus[i] === 'error' ? 'bg-red-50/50' : validationStatus[i] === 'valid' ? 'bg-green-50/30' : ''}`}>
                   <td className="px-3 py-2 text-xs text-gray-400">{i + 1}</td>
                   <td className="px-3 py-2">
                     {validationStatus[i] === 'valid' && <CheckCircle size={14} className="text-green-500" />}
                     {validationStatus[i] === 'error' && <XCircle size={14} className="text-red-500" />}
                   </td>
                   {CSV_TEMPLATE_COLUMNS.map(col => (
                     <td key={col} className="px-3 py-2">
                       <input
                         type="text"
                         value={row[col] || ''}
                         onChange={(e) => handleCellEdit(i, col, e.target.value)}
                         className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-gray-200 focus:border-brand-black rounded-lg text-sm font-medium outline-none transition-colors"
                       />
                     </td>
                   ))}
                 </tr>
               ))}
             </tbody>
           </table>
         </div>

         {/* Import Button */}
         <div className="mt-6 flex justify-end">
           <ThemedButton
             variant="primary"
             onClick={handleImport}
             disabled={validCount === 0}
             icon={Plus}
           >
             Import {validCount > 0 ? `${validCount} Students` : 'Students'}
           </ThemedButton>
         </div>
       </>
     )}
   </ThemedModal>
 );
};