
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, TreePine, ArrowRight } from 'lucide-react';

export type OrganizationType = 'gram_panchayat' | 'mahanagar_palika';

const OrganizationSelect: React.FC = () => {
  const navigate = useNavigate();

  const handleSelect = (org: OrganizationType) => {
    navigate(`/auth/role?org=${org}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white text-xl font-black">G</span>
          </div>
          <span className="font-bold text-gray-800">Gramnagar</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-3">
            Welcome to Gramnagar
          </h1>
          <p className="text-lg text-gray-500 max-w-md">
            Your civic services portal. Select your organization to continue.
          </p>
        </div>

        <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gram Panchayat Option */}
          <button
            onClick={() => handleSelect('gram_panchayat')}
            className="group bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-xl shadow-gray-100 hover:border-green-500 hover:shadow-green-100 transition-all duration-300 text-left"
          >
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-100 transition">
              <TreePine size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Gram Panchayat
            </h2>
            <p className="text-gray-500 mb-6">
              Rural local self-government for village administration and development
            </p>
            <div className="flex items-center text-green-600 font-bold group-hover:translate-x-2 transition-transform">
              Select <ArrowRight size={18} className="ml-2" />
            </div>
          </button>

          {/* Mahanagar Palika Option */}
          <button
            onClick={() => handleSelect('mahanagar_palika')}
            className="group bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-xl shadow-gray-100 hover:border-blue-500 hover:shadow-blue-100 transition-all duration-300 text-left"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition">
              <Building2 size={32} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Mahanagar Palika
            </h2>
            <p className="text-gray-500 mb-6">
              Urban municipal corporation for city governance and civic services
            </p>
            <div className="flex items-center text-blue-600 font-bold group-hover:translate-x-2 transition-transform">
              Select <ArrowRight size={18} className="ml-2" />
            </div>
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            A unified platform for citizens, workers, and administrators
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSelect;
