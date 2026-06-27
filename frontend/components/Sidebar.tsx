
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Users, 
  Settings, 
  BookOpen,
  CheckCircle2,
  Clock,
  ListTodo,
  History,
  DollarSign,
  Bell
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { UserRole } from '../types';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const getLinks = () => {
    switch (user?.role) {
      case UserRole.CITIZEN:
        return [
          { to: '/citizen', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
          { to: '/citizen/submit', icon: <PlusCircle size={20} />, label: 'New Complaint' },
          { to: '/citizen/complaints', icon: <FileText size={20} />, label: 'My Complaints' },
          { to: '/schemes', icon: <BookOpen size={20} />, label: 'Govt Schemes' },
          { to: '/citizen/taxes', icon: <DollarSign size={20} />, label: 'My Taxes' },
          { to: '/citizen/certificates', icon: <CheckCircle2 size={20} />, label: 'Certificates' },
          { to: '/citizen/notifications', icon: <Bell size={20} />, label: 'Notifications' },
        ];
      case UserRole.WORKER:
        return [
          { to: '/worker', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
          { to: '/worker/tasks', icon: <ListTodo size={20} />, label: 'Active Tasks' },
          { to: '/worker/history', icon: <History size={20} />, label: 'Completed' },
        ];
      case UserRole.ADMIN:
        return [
          { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
          { to: '/admin/workers', icon: <Users size={20} />, label: 'Manage Workers' },
          { to: '/admin/complaints', icon: <Clock size={20} />, label: 'Manage Complaints' },
          { to: '/admin/schemes', icon: <Settings size={20} />, label: 'Manage Schemes' },
          { to: '/admin/taxes', icon: <DollarSign size={20} />, label: 'Tax Management' },
          { to: '/admin/certificates', icon: <CheckCircle2 size={20} />, label: 'Certificate Apps' },
          { to: '/admin/notifications', icon: <Bell size={20} />, label: 'Notifications' },
        ];
      default:
        return [];
    }
  };

  return (
    <aside className="w-64 bg-white border-r h-full hidden lg:flex flex-col">
      <nav className="flex-1 py-6 px-4 space-y-1">
        {getLinks().map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) => `
              flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
              ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}
            `}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 text-center">Version 1.0.4 - Production</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
