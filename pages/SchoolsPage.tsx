import React, { useState } from 'react';
import { useTheme } from '../src/hooks/useTheme';
import { ThemedButton } from '../src/components/ThemedComponents';
import { ThemedModal } from '../src/components/ThemedModal';
import { ThemedInput, ThemedSelect } from '../src/components/ThemedFormField';
import { ThemedDataTable, TableColumn, ActionMenuItem } from '../src/components/ThemedDataTable';
import { Plus, MoreHorizontal, Users, Bus, LayoutGrid, List as ListIcon, Edit, FileText, Archive, Save, Check, ArrowRight } from 'lucide-react';
import { useSchoolData } from '../src/hooks/useAppData';
import { User as UserType, UserRole } from '../types';
import { StudentsPage } from './StudentsPage';

interface SchoolsPageProps {
 currentUser: UserType;
}

export const SchoolsPage: React.FC<SchoolsPageProps> = ({ currentUser }) => {
 // SMART DATA-FLOW: Use centralized hooks
 const { schools, createSchool, updateSchool, deleteSchool, isLoading, error } = useSchoolData();
 const { colors } = useTheme();
 const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
 const [openActionId, setOpenActionId] = useState<string | null>(null);
 
 // Tab State
 const [activeTab, setActiveTab] = useState<'institutions' | 'students'>(
 currentUser.role === UserRole.SUPER_ADMIN ? 'institutions' : 'students'
 );
 
 // Modals
 const [isAddModalOpen, setIsAddModalOpen] = useState(false);
 const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
 
 // State for forms
 const [newSchoolName, setNewSchoolName] = useState('');
 const [editingSchool, setEditingSchool] = useState<{ id: string; name: string } | null>(null);
 const [selectedSchool, setSelectedSchool] = useState<{ id: string; name: string } | null>(null);

 const toggleAction = (id: string, e: React.MouseEvent) => {
 e.stopPropagation();
 setOpenActionId(openActionId === id ? null : id);
 };

 const handleAddSchool = async () => {
 if (!newSchoolName.trim()) return;
 try {
 await createSchool({ name: newSchoolName });
 setNewSchoolName('');
 setIsAddModalOpen(false);
 } catch (err: any) {
 alert('Failed to add school: ' + (err?.message || 'Unknown error'));
 }
 };

 const handleArchive = async (id: string) => {
 if (window.confirm('Are you sure you want to archive this school?')) {
 try {
 await deleteSchool(id);
 } catch (err: any) {
 alert('Failed to archive school: ' + (err?.message || 'Unknown error'));
 }
 }
 };

 const openEditModal = (school: { id: string; name: string }) => {
 setEditingSchool(school);
 setIsEditModalOpen(true);
 setOpenActionId(null);
 };

 const handleSaveEdit = async () => {
 if (editingSchool) {
 try {
 await updateSchool(editingSchool.id, { name: editingSchool.name });
 setIsEditModalOpen(false);
 setEditingSchool(null);
 } catch (err: any) {
 alert('Failed to update school: ' + (err?.message || 'Unknown error'));
 }
 }
 };

 const openDetailsModal = (school: { id: string; name: string }) => {
 setSelectedSchool(school);
 setIsDetailsModalOpen(true);
 setOpenActionId(null);
 };

 return (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" onClick={() => setOpenActionId(null)}>
 
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
 <div>
 <h1 className="text-5xl font-medium text-brand-black tracking-tight mb-2">Schools</h1>
 <p className="text-gray-500 font-normal text-xl mb-6">Contract management and institution oversight.</p>
 
 {/* Super Admin Tabs - Moved below text */}
 {currentUser.role === UserRole.SUPER_ADMIN && (
 <div className="inline-flex p-1.5 bg-white rounded-full border border-gray-100 shadow-sm">
 <button
 onClick={() => setActiveTab('institutions')}
 className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
 activeTab === 'institutions'
 ? 'text-white shadow-lg'
 : 'text-gray-400 hover:text-brand-black'
 }`}
 style={activeTab === 'institutions' ? { backgroundColor: colors.primary } : undefined}
 >
 Institutions
 </button>
 <button
 onClick={() => setActiveTab('students')}
 className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
 activeTab === 'students'
 ? 'text-white shadow-lg'
 : 'text-gray-400 hover:text-brand-black'
 }`}
 style={activeTab === 'students' ? { backgroundColor: colors.primary } : undefined}
 >
 Students
 </button>
 </div>
 )}
 </div>
 
 {/* Actions - Only visible for Institutions Tab */}
 {activeTab === 'institutions' && (
 <div className="flex items-center gap-3">
 <ThemedButton 
 variant="primary"
 onClick={() => setIsAddModalOpen(true)}
 icon={Plus}
 >
 Add School
 </ThemedButton>

 {/* View Toggle */}
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
 )}
 </div>

 {/* Conditional Rendering */}
 {activeTab === 'students' ? (
 <StudentsPage currentUser={currentUser} showHeader={false} />
 ) : (
 /* Original Schools Content */
 <>
 {viewMode === 'grid' ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {schools.map(school => (
 <div key={school.id} className="bg-white p-8 rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100 hover:border-brand-lilac/30 hover:shadow-lg transition-all group relative">
 <div className="flex justify-between items-start mb-8">
 <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-brand-black font-bold text-xl border border-gray-100 group-hover:bg-brand-lilac/10 group-hover:text-brand-lilac transition-colors">
 {school.name.substring(0, 2).toUpperCase()}
 </div>
 
 <div className="relative">
 <button 
 onClick={(e) => toggleAction(school.id, e)}
 className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors"
 >
 <MoreHorizontal size={20} />
 </button>
 {openActionId === school.id && (
 <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 p-1.5 animate-in fade-in zoom-in-95 duration-200">
 <button onClick={() => openEditModal(school)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors">
 <Edit size={14} /> Edit Details
 </button>
 <button onClick={() => openDetailsModal(school)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors">
 <FileText size={14} /> View Contract
 </button>
 <div className="h-px bg-gray-50 my-1"></div>
 <button onClick={() => handleArchive(school.id)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors">
 <Archive size={14} /> Archive
 </button>
 </div>
 )}
 </div>
 </div>
 
 <h3 className="text-2xl font-bold text-brand-black mb-1">{school.name}</h3>
 <p className="text-sm text-gray-500 font-medium">ID: {school.id}</p>

 <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-2 gap-4">
 <div>
 <p className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
 <Users size={14} /> Students
 </p>
 <p className="text-xl font-medium text-brand-black">1,240</p>
 </div>
 <div>
 <p className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
 <Bus size={14} /> Active Routes
 </p>
 <p className="text-xl font-medium text-brand-black">18</p>
 </div>
 </div>

 <div className="mt-6 flex gap-3">
 <ThemedButton 
 variant="primary"
 onClick={() => openDetailsModal(school)}
 className="flex-1"
 >
 View Details
 </ThemedButton>
 <ThemedButton 
 variant="cancel"
 onClick={() => openEditModal(school)}
 >
 Settings
 </ThemedButton>
 </div>
 </div>
 ))}
 
 {/* Add New Placeholder Card */}
 <button onClick={() => setIsAddModalOpen(true)} className="bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 hover:bg-white hover:border-brand-lilac/50 hover:shadow-lg transition-all min-h-[300px] text-gray-400 hover:text-brand-lilac">
 <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center">
 <Plus size={32} />
 </div>
 <span className="font-bold text-lg">Register New Institution</span>
 </button>
 </div>
 ) : (
 /* List View */
 <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 min-h-125">
 <ThemedDataTable
   columns={[
     {
       header: 'School Name',
       key: 'name',
       render: (school) => (
         <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-black font-bold text-xs border border-gray-100">
             {school.name.substring(0, 2).toUpperCase()}
           </div>
           <div>
             <div className="font-bold text-brand-black text-base">{school.name}</div>
             <div className="text-xs font-medium text-gray-400 mt-1">ID: {school.id}</div>
           </div>
         </div>
       ),
     },
     {
       header: 'Students',
       key: 'students',
       render: () => (
         <div className="flex items-center gap-2 font-medium text-gray-600">
           <Users size={16} className="text-gray-400" /> 1,240
         </div>
       ),
     },
     {
       header: 'Active Routes',
       key: 'routes',
       render: () => (
         <div className="flex items-center gap-2 font-medium text-gray-600">
           <Bus size={16} className="text-gray-400" /> 18
         </div>
       ),
     },
     {
       header: 'Account Manager',
       key: 'manager',
       render: () => (
         <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded-full bg-brand-lilac/20 flex items-center justify-center text-xs font-bold text-brand-lilac">SM</div>
           <span className="text-sm font-medium text-gray-600">Sarah Manager</span>
         </div>
       ),
     },
   ]}
   data={schools}
   rowKey={(school) => school.id}
   actions={[
     { label: 'Edit Details', icon: <Edit size={14} />, onClick: (school) => openEditModal(school) },
     { label: 'Contracts', icon: <FileText size={14} />, onClick: (school) => openDetailsModal(school) },
     { label: 'Archive', icon: <Archive size={14} />, onClick: (school) => handleArchive(school.id), divider: true, className: 'text-red-500 hover:bg-red-50' },
   ]}
 />
 </div>
 )}
 </>
 )}

 {/* Add School Modal */}
 <ThemedModal
   isOpen={isAddModalOpen}
   onClose={() => setIsAddModalOpen(false)}
   title="Register Institution"
   size="lg"
   footer={
     <ThemedButton 
       variant="primary"
       onClick={handleAddSchool}
       icon={Check}
     >
       Register School
     </ThemedButton>
   }
 >
   <div className="space-y-4">
     <ThemedInput
       label="School Name"
       type="text"
       value={newSchoolName}
       onChange={(e) => setNewSchoolName(e.target.value)}
       placeholder="e.g. Westside High School"
       autoFocus
     />
     <ThemedInput
       label="Account Manager"
       type="text"
       placeholder="Assign manager..."
     />
   </div>
 </ThemedModal>

 {/* Edit School Modal */}
 <ThemedModal
   isOpen={isEditModalOpen && editingSchool !== null}
   onClose={() => setIsEditModalOpen(false)}
   title="Edit Institution"
   size="lg"
   footer={
     <ThemedButton 
       variant="primary"
       onClick={handleSaveEdit}
       icon={Save}
     >
       Save Changes
     </ThemedButton>
   }
 >
   {editingSchool && (
     <div className="space-y-4">
       <ThemedInput
         label="School Name"
         type="text"
         value={editingSchool.name}
         onChange={(e) => setEditingSchool({ ...editingSchool, name: e.target.value })}
       />
       <ThemedInput
         label="Account Manager"
         type="text"
         defaultValue="Sarah Manager"
       />
     </div>
   )}
 </ThemedModal>

 {/* View Details Modal */}
 <ThemedModal
   isOpen={isDetailsModalOpen && selectedSchool !== null}
   onClose={() => setIsDetailsModalOpen(false)}
   size="xl"
   showCloseButton
   className="p-10 overflow-hidden rounded-[2.5rem]"
 >
   {selectedSchool && (
     <>
       <div className="flex flex-col items-center text-center mb-8">
         <div className="w-24 h-24 rounded-3xl bg-brand-black text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-lg">
           {selectedSchool.name.substring(0, 2).toUpperCase()}
         </div>
         <h2 className="text-3xl font-bold text-brand-black">{selectedSchool.name}</h2>
         <p className="text-gray-500 font-mono mt-2">ID: {selectedSchool.id}</p>
       </div>

       <div className="grid grid-cols-2 gap-6 mb-8">
         <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Students</p>
           <p className="text-3xl font-bold text-brand-black">1,240</p>
         </div>
         <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Routes</p>
           <p className="text-3xl font-bold text-brand-black">18</p>
         </div>
       </div>

       <div className="space-y-4">
         <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer">
           <div className="flex items-center gap-4">
             <div className="p-2 bg-brand-lilac/10 text-brand-lilac rounded-xl"><FileText size={20}/></div>
             <div>
               <p className="font-bold text-brand-black">Service Agreement</p>
               <p className="text-xs text-gray-400">Expires Dec 2024</p>
             </div>
           </div>
           <ArrowRight size={18} className="text-gray-400"/>
         </div>
         <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer">
           <div className="flex items-center gap-4">
             <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl"><Check size={20}/></div>
             <div>
               <p className="font-bold text-brand-black">Compliance Status</p>
               <p className="text-xs text-gray-400">All checks passed</p>
             </div>
           </div>
           <ArrowRight size={18} className="text-gray-400"/>
         </div>
       </div>
     </>
   )}
 </ThemedModal>

 </div>
 );
};