
import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { authApi } from '../../api/auth.api';
import { 
  Mail, 
  Lock, 
  LogIn, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  TreePine,
  Building2,
  Shield,
  Wrench,
  Users
} from 'lucide-react';
import { UserRole } from '../../types';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const org = searchParams.get('org') || 'gram_panchayat';
  const selectedRole = searchParams.get('role') || 'citizen';

  // Debug: Log when default values are used
  React.useEffect(() => {
    if (!searchParams.get('role')) {
      console.warn('LoginPage: No role parameter provided, using default citizen role');
    }
    if (!searchParams.get('org')) {
      console.warn('LoginPage: No org parameter provided, using default gram_panchayat');
    }
  }, [searchParams]);

  const orgName = org === 'gram_panchayat' ? 'Gram Panchayat' : 'Nagar Palika';
  const orgColor = org === 'gram_panchayat' ? 'green' : 'blue';

  const getRoleInfo = () => {
    switch (selectedRole) {
      case 'admin':
        return { name: 'Administrator', icon: Shield, color: 'purple' };
      case 'worker':
        return { name: 'Field Worker', icon: Wrench, color: 'orange' };
      default:
        return { name: 'Citizen', icon: Users, color: 'blue' };
    }
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await authApi.login({ email, password });
      const { access_token, role, organization, organization_name, name } = response.data;

      // Verify role matches selection
      if (role !== selectedRole) {
        setError(`This account is registered as ${role}, not ${selectedRole}. Please go back and select the correct role, or click "Change Role" above.`);
        setIsSubmitting(false);
        return;
      }

      // Organization-based access control
      // Workers and Admins can only login to their organization
      if (role !== 'citizen' && organization !== org) {
        setError(`This ${role} account belongs to ${organization_name}, not ${orgName}. Please select the correct organization.`);
        setIsSubmitting(false);
        return;
      }

      const user = { 
        email, 
        role, 
        organization: organization,
        organizationName: organization_name,
        name: name,
        id: response.data.user_id
      };
      login(user, access_token, organization, organization_name);

      if (role === UserRole.ADMIN) navigate('/admin');
      else if (role === UserRole.WORKER) navigate('/worker');
      else navigate('/citizen');

    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Invalid credentials. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(`/auth/role?org=${org}`);
  };

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
          Change Role
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {/* Context Badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
            org === 'gram_panchayat' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {org === 'gram_panchayat' ? <TreePine size={14} /> : <Building2 size={14} />}
            <span className="font-medium">{orgName}</span>
          </div>
          <span className="text-gray-300">•</span>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-${roleInfo.color}-100 text-${roleInfo.color}-700`}
            style={{
              backgroundColor: roleInfo.color === 'purple' ? '#f3e8ff' : roleInfo.color === 'orange' ? '#ffedd5' : '#dbeafe',
              color: roleInfo.color === 'purple' ? '#7c3aed' : roleInfo.color === 'orange' ? '#ea580c' : '#2563eb'
            }}
          >
            <RoleIcon size={14} />
            <span className="font-medium">{roleInfo.name}</span>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-gray-900 mb-2">
              Sign In
            </h1>
            <p className="text-gray-500">
              Login to {orgName} as {roleInfo.name}
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl shadow-gray-200 rounded-3xl border border-gray-100">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-start space-x-2 text-sm">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3 rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 font-bold shadow-lg shadow-blue-100 transition"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <LogIn size={18} className="mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {selectedRole === 'citizen' && (
              <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm">
                New citizen?{' '}
                <Link 
                  to={`/auth/register?org=${org}`} 
                  className="font-bold text-blue-600 hover:underline"
                >
                  Register here
                </Link>
              </div>
            )}
          </div>

          {/* Step Indicator */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                org === 'gram_panchayat' ? 'bg-green-600' : 'bg-blue-600'
              } text-white`}>
                1
              </div>
              <span className="text-xs text-gray-500">Org</span>
            </div>
            <div className="w-6 h-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: roleInfo.color === 'purple' ? '#7c3aed' : roleInfo.color === 'orange' ? '#ea580c' : '#2563eb',
                  color: 'white'
                }}
              >
                2
              </div>
              <span className="text-xs text-gray-500">Role</span>
            </div>
            <div className="w-6 h-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <span className="text-xs font-bold text-gray-800">Login</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
