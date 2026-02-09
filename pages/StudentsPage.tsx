import React, { useState, useRef } from 'react';
import { useTheme } from '../src/hooks/useTheme';
import { ThemedButton } from '../src/components/ThemedComponents';
import { Search, Plus, MoreHorizontal, Bus, CheckCircle, Clock, XCircle, UserX, Upload, ChevronDown, Trash2, Edit2, RefreshCw, X, Check, LayoutGrid, List as ListIcon } from 'lucide-react';
import { User } from '../types';

interface StudentsPageProps {
 currentUser: User;
 showHeader?: boolean;
}

const INITIAL_STUDENTS = [
 { id: 'ST1', name: 'Alice Johnson', school: 'International Academy', grade: '5th Grade', guardian: 'Martha Johnson', status: 'ON_BOARD' },
 { id: 'ST2', name: 'Bob Smith', school: 'City High School', grade: '10th Grade', guardian: 'John Smith', status: 'DROPPED_OFF' },
 { id: 'ST3', name: 'Charlie Brown', school: 'Valley Elementary', grade: '2nd Grade', guardian: 'Snoopy Brown', status: 'ABSENT' },
 { id: 'ST4', name: 'Daisy Ridley', school: 'International Academy', grade: '5th Grade', guardian: 'Mark Ridley', status: 'WAITING' },
 { id: 'ST5', name: 'Ethan Hunt', school: 'City High School', grade: '12th Grade', guardian: 'Tom Hunt', status: 'DROPPED_OFF' },
];

export const StudentsPage: React.FC<StudentsPageProps> = ({ currentUser, showHeader = true }) => {
 const [students, setStudents] = useState(INITIAL_STUDENTS);
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
 add: false
 });

 // Form State for Add/Edit
 const [formData, setFormData] = useState<any>({});

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
 fileInputRef.current?.click();
 };

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files && e.target.files.length > 0) {
 alert(`Successfully uploaded ${e.target.files[0].name}. 15 records added.`);
 // Simulate adding
 const newStudent = { id: `ST${students.length + 1}`, name: 'Imported Student', school: 'City High School', grade: '9th Grade', guardian: 'System Import', status: 'WAITING' };
 setStudents([...students, newStudent]);
 e.target.value = ''; // Reset
 }
 };

 const toggleStudentDisable = (id: string) => {
 setStudents(prev => prev.map(s => 
 s.id === id ? { ...s, status: s.status === 'DISABLED' ? 'WAITING' : 'DISABLED' } : s
 ));
 setOpenActionId(null);
 };

 const openModal = (type: 'edit' | 'trips' | 'transfer', student: any) => {
 setSelectedStudent(student);
 setFormData(student); // Pre-fill for edit/transfer
 setModals(prev => ({ ...prev, [type]: true }));
 setOpenActionId(null);
 };

 const closeModal = (type: 'edit' | 'trips' | 'transfer' | 'add') => {
 setModals(prev => ({ ...prev, [type]: false }));
 setSelectedStudent(null);
 setFormData({});
 };

 const handleSaveEdit = () => {
 setStudents(students.map(s => s.id === formData.id ? { ...s, ...formData } : s));
 closeModal('edit');
 };

 const handleTransfer = () => {
 let updatedStudent = { ...selectedStudent };
 if (formData.newSchool) {
 updatedStudent.school = formData.newSchool;
 }
 if (formData.newGrade) {
 updatedStudent.grade = formData.newGrade;
 }
 setStudents(students.map(s => s.id === selectedStudent.id ? updatedStudent : s));
 closeModal('transfer');
 };

 const handleAddStudent = () => {
 const newStudent = {
 id: `ST${students.length + 10}`,
 name: formData.name || 'New Student',
 school: formData.school || schools[0],
 grade: formData.grade || '1st Grade',
 guardian: formData.guardian || 'Unknown',
 status: 'WAITING'
 };
 setStudents([...students, newStudent]);
 closeModal('add');
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
 <table className="w-full text-left">
 <thead className="bg-gray-50/50 text-gray-400 font-bold text-xs uppercase tracking-widest">
 <tr>
 <th className="px-8 py-6 pl-10">Student Name</th>
 <th className="px-8 py-6">School & Grade</th>
 <th className="px-8 py-6">Guardian</th>
 <th className="px-8 py-6 text-center">Status</th>
 <th className="px-8 py-6 text-right pr-10">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {filteredStudents.map(student => (
 <tr key={student.id} className="hover:bg-gray-50/80 transition-colors group cursor-pointer">
 <td className="px-8 py-5 pl-10">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-black font-bold text-sm border border-gray-100">
 {student.name.charAt(0)}
 </div>
 <div>
 <div className="font-bold text-brand-black text-base">{student.name}</div>
 <div className="text-xs font-medium text-gray-400 mt-0.5">ID: {student.id}</div>
 </div>
 </div>
 </td>
 <td className="px-8 py-5">
 <p className="font-bold text-sm text-brand-black truncate">{student.school}</p>
 <p className="text-xs text-gray-500 font-medium mt-0.5">{student.grade}</p>
 </td>
 <td className="px-8 py-5">
 <p className="font-medium text-sm text-gray-600 truncate">{student.guardian}</p>
 </td>
 <td className="px-8 py-5 text-center">
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
 </td>
 <td className="px-8 py-5 text-right pr-10 relative">
 <button 
 onClick={(e) => toggleAction(student.id, e)}
 className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:bg-brand-black hover:text-white transition-all z-10 relative"
 >
 <MoreHorizontal size={20} />
 </button>
 
 {openActionId === student.id && (
 <div className="absolute right-10 top-12 mt-0 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200">
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
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {/* Edit Modal */}
 {modals.edit && selectedStudent && (
 <div className="fixed inset-0 z-[70] isolate">
 <div className="absolute inset-0 bg-brand-black/40 backdrop-blur-md" onClick={() => closeModal('edit')} />
 <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
 <div className="relative bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 pointer-events-auto">
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-2xl font-bold text-brand-black">Edit Student</h3>
 <button onClick={() => closeModal('edit')} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X size={18}/></button>
 </div>
 <div className="space-y-4">
 <div>
 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Name</label>
 <input 
 type="text" 
 value={formData.name || ''} 
 onChange={(e) => setFormData({...formData, name: e.target.value})}
 className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-black" 
 />
 </div>
 <div>
 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">School</label>
 <select 
 value={formData.school || ''} 
 onChange={(e) => setFormData({...formData, school: e.target.value})}
 className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-black appearance-none" 
 >
 {schools.map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 </div>
 <div>
 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Grade</label>
 <select 
 value={formData.grade || ''} 
 onChange={(e) => setFormData({...formData, grade: e.target.value})}
 className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-black appearance-none" 
 >
 {grades.map(g => <option key={g} value={g}>{g}</option>)}
 </select>
 </div>
 <div>
 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Guardian</label>
 <input 
 type="text" 
 value={formData.guardian || ''} 
 onChange={(e) => setFormData({...formData, guardian: e.target.value})}
 className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-black" 
 />
 </div>
 </div>
 <div className="mt-8 flex justify-end">
 <ThemedButton variant="primary" onClick={handleSaveEdit}>Save Changes</ThemedButton>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Transfer Modal */}
 {modals.transfer && selectedStudent && (
 <div className="fixed inset-0 z-[70] isolate">
 <div className="absolute inset-0 bg-brand-black/40 backdrop-blur-md" onClick={() => closeModal('transfer')} />
 <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
 <div className="relative bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 pointer-events-auto">
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-2xl font-bold text-brand-black">Transfer Student</h3>
 <button onClick={() => closeModal('transfer')} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X size={18}/></button>
 </div>
 <div className="p-4 bg-brand-lilac/10 rounded-xl text-brand-lilac text-sm font-bold mb-6">
 Current: {selectedStudent.school}
 </div>
 <div className="space-y-4">
 <div>
 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">New School</label>
 <select 
 onChange={(e) => setFormData({...formData, newSchool: e.target.value})}
 className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-black appearance-none"
 >
 <option value="">Select New School</option>
 {schools.filter(s => s !== selectedStudent.school).map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 </div>
 <div>
 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">New Grade (Optional)</label>
 <select 
 onChange={(e) => setFormData({...formData, newGrade: e.target.value})}
 className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-black appearance-none"
 >
 <option value="">Keep Current Grade ({selectedStudent.grade})</option>
 {grades.map(g => <option key={g} value={g}>{g}</option>)}
 </select>
 </div>
 </div>
 <div className="mt-8 flex justify-end">
 <ThemedButton variant="primary" onClick={handleTransfer}>Confirm Transfer</ThemedButton>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Add Student Modal */}
 {modals.add && (
 <div className="fixed inset-0 z-[70] isolate">
 <div className="absolute inset-0 bg-brand-black/40 backdrop-blur-md" onClick={() => closeModal('add')} />
 <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
 <div className="relative bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 pointer-events-auto">
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-2xl font-bold text-brand-black">Add New Student</h3>
 <button onClick={() => closeModal('add')} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X size={18}/></button>
 </div>
 <div className="space-y-4">
 <div>
 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Name</label>
 <input type="text" onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-black" />
 </div>
 <div>
 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">School</label>
 <select onChange={(e) => setFormData({...formData, school: e.target.value})} className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-black appearance-none">
 {schools.map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 </div>
 <div>
 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Grade</label>
 <select onChange={(e) => setFormData({...formData, grade: e.target.value})} className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-black appearance-none">
 {grades.map(g => <option key={g} value={g}>{g}</option>)}
 </select>
 </div>
 <div>
 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Guardian</label>
 <input type="text" onChange={(e) => setFormData({...formData, guardian: e.target.value})} className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-black" />
 </div>
 </div>
 <div className="mt-8 flex justify-end">
 <ThemedButton variant="primary" onClick={handleAddStudent} icon={Plus}>
 Add Student
 </ThemedButton>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Recent Trips Modal */}
 {modals.trips && selectedStudent && (
 <div className="fixed inset-0 z-[70] isolate">
 <div className="absolute inset-0 bg-brand-black/40 backdrop-blur-md" onClick={() => closeModal('trips')} />
 <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
 <div className="relative bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 pointer-events-auto">
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-2xl font-bold text-brand-black">Recent History</h3>
 <button onClick={() => closeModal('trips')} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X size={18}/></button>
 </div>
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
 </div>
 </div>
 </div>
 )}

 </div>
 );
};