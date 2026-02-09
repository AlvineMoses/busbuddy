import React, { useState } from 'react';
import { useTheme } from '../src/hooks/useTheme';
import { ThemedButton } from '../src/components/ThemedComponents';
import { Bell, CheckCircle, AlertCircle, Info, X, Check, Trash2, Filter } from 'lucide-react';

interface Notification {
 id: string;
 type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
 title: string;
 message: string;
 timestamp: string;
 read: boolean;
 actionable?: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
 {
 id: 'N-001',
 type: 'WARNING',
 title: 'Route Delay Detected',
 message: 'Route A - North is running 15 minutes behind schedule',
 timestamp: '2024-02-15T08:30:00',
 read: false,
 actionable: true
 },
 {
 id: 'N-002',
 type: 'SUCCESS',
 title: 'Trip Completed',
 message: 'Morning pickup for Greenfield Academy completed successfully',
 timestamp: '2024-02-15T08:15:00',
 read: false
 },
 {
 id: 'N-003',
 type: 'INFO',
 title: 'New Driver Registered',
 message: 'Emily Rodriguez has been added to the system',
 timestamp: '2024-02-15T07:45:00',
 read: true
 },
 {
 id: 'N-004',
 type: 'ERROR',
 title: 'Vehicle Breakdown',
 message: 'Bus KCA-123X reported mechanical issue. Route reassigned.',
 timestamp: '2024-02-14T15:20:00',
 read: true,
 actionable: true
 },
 {
 id: 'N-005',
 type: 'INFO',
 title: 'System Maintenance',
 message: 'Scheduled maintenance on Saturday 2-4 AM',
 timestamp: '2024-02-14T10:00:00',
 read: true
 }
];

export const NotificationsPage: React.FC = () => {
 const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
 const { colors } = useTheme();
 const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'>('ALL');

 const filteredNotifications = notifications.filter(n => {
 if (filter === 'ALL') return true;
 if (filter === 'UNREAD') return !n.read;
 return n.type === filter;
 });

 const unreadCount = notifications.filter(n => !n.read).length;

 const markAsRead = (id: string) => {
 setNotifications(notifications.map(n =>
 n.id === id ? { ...n, read: true } : n
 ));
 };

 const markAllAsRead = () => {
 setNotifications(notifications.map(n => ({ ...n, read: true })));
 };

 const deleteNotification = (id: string) => {
 setNotifications(notifications.filter(n => n.id !== id));
 };

 const getIcon = (type: string) => {
 switch (type) {
 case 'SUCCESS': return <CheckCircle size={20} className="text-green-600" />;
 case 'WARNING': return <AlertCircle size={20} className="text-amber-600" />;
 case 'ERROR': return <X size={20} className="text-red-600" />;
 default: return <Info size={20} className="text-blue-600" />;
 }
 };

 const getBackgroundClass = (type: string, read: boolean) => {
 const opacity = read ? '30' : '50';
 switch (type) {
 case 'SUCCESS': return `bg-green-${opacity} border-green-100`;
 case 'WARNING': return `bg-amber-${opacity} border-amber-100`;
 case 'ERROR': return `bg-red-${opacity} border-red-100`;
 default: return `bg-blue-${opacity} border-blue-100`;
 }
 };

 const formatTime = (timestamp: string) => {
 const date = new Date(timestamp);
 const now = new Date();
 const diff = now.getTime() - date.getTime();
 const minutes = Math.floor(diff / 60000);
 const hours = Math.floor(diff / 3600000);
 const days = Math.floor(diff / 86400000);

 if (minutes < 60) return `${minutes}m ago`;
 if (hours < 24) return `${hours}h ago`;
 return `${days}d ago`;
 };

 return (
 <div className="space-y-8 animate-in fade-in duration-700">
 
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
 <div>
 <h1 className="text-5xl font-medium text-brand-black tracking-tight mb-2">Notifications</h1>
 <p className="text-gray-500 font-normal text-xl">
 {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
 </p>
 </div>
 {unreadCount > 0 && (
 <ThemedButton variant="ghost" onClick={markAllAsRead} icon={Check}>
 Mark All as Read
 </ThemedButton>
 )}
 </div>

 {/* Filters */}
 <div className="bg-white rounded-[2.5rem] p-6 shadow-soft-xl border border-gray-100">
 <div className="flex flex-wrap gap-3">
 <button
 onClick={() => setFilter('ALL')}
 className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
 filter === 'ALL'
 ? 'bg- text-white shadow-lg'
 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
 }`}
 >
 All ({notifications.length})
 </button>
 <button
 onClick={() => setFilter('UNREAD')}
 className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
 filter === 'UNREAD'
 ? 'bg- text-white shadow-lg'
 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
 }`}
 >
 Unread ({unreadCount})
 </button>
 <button
 onClick={() => setFilter('INFO')}
 className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
 filter === 'INFO'
 ? 'bg-blue-600 text-white shadow-lg'
 : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
 }`}
 >
 Info
 </button>
 <button
 onClick={() => setFilter('SUCCESS')}
 className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
 filter === 'SUCCESS'
 ? 'bg-green-600 text-white shadow-lg'
 : 'bg-green-50 text-green-600 hover:bg-green-100'
 }`}
 >
 Success
 </button>
 <button
 onClick={() => setFilter('WARNING')}
 className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
 filter === 'WARNING'
 ? 'bg-amber-600 text-white shadow-lg'
 : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
 }`}
 >
 Warnings
 </button>
 <button
 onClick={() => setFilter('ERROR')}
 className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
 filter === 'ERROR'
 ? 'bg-red-600 text-white shadow-lg'
 : 'bg-red-50 text-red-600 hover:bg-red-100'
 }`}
 >
 Errors
 </button>
 </div>
 </div>

 {/* Notifications List */}
 <div className="space-y-4">
 {filteredNotifications.map((notification) => (
 <div
 key={notification.id}
 className={`bg-white rounded-[2rem] p-6 shadow-soft-xl border transition-all ${
 notification.read ? 'border-gray-100' : 'border-/20 shadow-xl'
 } hover:shadow-2xl group`}
 >
 <div className="flex items-start gap-4">
 {/* Icon */}
 <div className="flex-shrink-0 mt-1">
 {getIcon(notification.type)}
 </div>

 {/* Content */}
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-4 mb-2">
 <h3 className={`font-bold text-lg ${notification.read ? 'text-gray-600' : 'text-brand-black'}`}>
 {notification.title}
 </h3>
 <span className="text-xs text-gray-400 whitespace-nowrap">
 {formatTime(notification.timestamp)}
 </span>
 </div>
 
 <p className={`text-sm mb-3 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
 {notification.message}
 </p>

 {/* Actions */}
 <div className="flex items-center gap-3">
 {!notification.read && (
 <button
 onClick={() => markAsRead(notification.id)}
 className="text-xs font-bold text- hover:underline"
 >
 Mark as Read
 </button>
 )}
 {notification.actionable && (
 <button className="text-xs font-bold text-blue-600 hover:underline">
 View Details
 </button>
 )}
 <button
 onClick={() => deleteNotification(notification.id)}
 className="ml-auto p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
 >
 <Trash2 size={14} />
 </button>
 </div>
 </div>

 {/* Unread Indicator */}
 {!notification.read && (
 <div className="flex-shrink-0">
 <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_{colors.primary}]"></div>
 </div>
 )}
 </div>
 </div>
 ))}

 {filteredNotifications.length === 0 && (
 <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-[2.5rem] shadow-soft-xl border border-gray-100">
 <Bell size={48} className="mb-4 text-gray-300" />
 <p className="text-lg font-medium text-gray-600">No notifications</p>
 <p className="text-sm">You're all caught up!</p>
 </div>
 )}
 </div>
 </div>
 );
};
