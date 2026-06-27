
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Wrench, Users, ArrowLeft, ArrowRight, TreePine, Building2 } from 'lucide-react';
import { UserRole } from '../../types';

const RoleSelect: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const org = searchParams.get('org') || 'gram_panchayat';

  const orgName = org === 'gram_panchayat' ? 'Gram Panchayat' : 'Mahanagar Palika';
  const orgColor = org === 'gram_panchayat' ? 'green' : 'blue';

  const handleSelect = (role: UserRole) => {
    navigate(`/auth/login?org=${org}&role=${role}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  const roles = [
    {
      role: UserRole.ADMIN,
      title: 'Administrator',
      description: 'Manage workers, oversee complaints, and configure schemes',
      icon: Shield,
      color: 'purple',
      bgColor: 'bg-purple-50',
      hoverBorder: 'hover:border-purple-500',
      hoverShadow: 'hover:shadow-purple-100',
      textColor: 'text-purple-600',
    },
    {
      role: UserRole.WORKER,
      title: 'Field Worker',
      description: 'View assigned tasks, update progress, and submit completion proofs',
      icon: Wrench,
      color: 'orange',
      bgColor: 'bg-orange-50',
      hoverBorder: 'hover:border-orange-500',
      hoverShadow: 'hover:shadow-orange-100',
      textColor: 'text-orange-600',
    },
    {
      role: UserRole.CITIZEN,
      title: 'Citizen',
      description: 'File complaints, track status, and explore government schemes',
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      hoverBorder: 'hover:border-blue-500',
      hoverShadow: 'hover:shadow-blue-100',
      textColor: 'text-blue-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white text-xl font-black">G</span>
          </div>
          <span className="font-bold text-gray-800">Gramnagar</span>
        </div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition"
        >
          <ArrowLeft size={18} />
          Change Organization
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {/* Organization Badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
          org === 'gram_panchayat' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {org === 'gram_panchayat' ? <TreePine size={18} /> : <Building2 size={18} />}
          <span className="font-bold">{orgName}</span>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 mb-3">
            Select Your Role
          </h1>
          <p className="text-gray-500 max-w-md">
            Choose how you want to access the {orgName} portal
          </p>
        </div>

        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map(({ role, title, description, icon: Icon, bgColor, hoverBorder, hoverShadow, textColor }) => (
            <button
              key={role}
              onClick={() => handleSelect(role)}
              className={`group bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-lg shadow-gray-100 ${hoverBorder} ${hoverShadow} transition-all duration-300 text-left`}
            >
              <div className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <Icon size={28} className={textColor} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 mb-4 min-h-[48px]">{description}</p>
              <div className={`flex items-center ${textColor} font-bold text-sm group-hover:translate-x-1 transition-transform`}>
                Continue <ArrowRight size={16} className="ml-1" />
              </div>
            </button>
          ))}
        </div>

        {/* Step Indicator */}
        <div className="mt-12 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              org === 'gram_panchayat' ? 'bg-green-600' : 'bg-blue-600'
            } text-white`}>
              1
            </div>
            <span className="text-sm text-gray-500">Organization</span>
          </div>
          <div className="w-8 h-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm font-bold">
              2
            </div>
            <span className="text-sm font-bold text-gray-800">Role</span>
          </div>
          <div className="w-8 h-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">
              3
            </div>
            <span className="text-sm text-gray-400">Login</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
