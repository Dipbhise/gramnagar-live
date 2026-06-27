
import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { LogOut, User as UserIcon, Bell } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white font-bold">C</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800 hidden md:block">Gramnagar</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
          <Bell size={20} />
        </button>
        <div className="h-8 w-px bg-gray-200" />
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-none">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
