
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  BookOpen,
  Settings,
  Users,
  ListTodo,
  History
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { UserRole } from '../types';

const MobileNav: React.FC = () => {
  const { user } = useAuth();

  const getLinks = () => {
    switch (user?.role) {
      case UserRole.CITIZEN:
        return [
          { to: '/citizen', icon: <LayoutDashboard size={20} />, label: 'Home' },
          { to: '/citizen/submit', icon: <PlusCircle size={20} />, label: 'Submit' },
          { to: '/citizen/complaints', icon: <FileText size={20} />, label: 'Status' },
          { to: '/schemes', icon: <BookOpen size={20} />, label: 'Schemes' },
        ];
      case UserRole.WORKER:
        return [
          { to: '/worker', icon: <LayoutDashboard size={20} />, label: 'Home' },
          { to: '/worker/tasks', icon: <ListTodo size={20} />, label: 'Tasks' },
          { to: '/worker/history', icon: <History size={20} />, label: 'History' },
        ];
      case UserRole.ADMIN:
        return [
          { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Overview' },
          { to: '/admin/workers', icon: <Users size={20} />, label: 'Workers' },
          { to: '/admin/complaints', icon: <FileText size={20} />, label: 'Requests' },
          { to: '/admin/schemes', icon: <Settings size={20} />, label: 'Schemes' },
        ];
      default:
        return [];
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 px-2 z-50">
      {getLinks().map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end
          className={({ isActive }) => `
            flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors
            ${isActive ? 'text-blue-600' : 'text-gray-400'}
          `}
        >
          {link.icon}
          <span className="text-[10px] font-medium uppercase tracking-wider">{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileNav;
