import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import {
  Mail,
  Lock,
  User,
  Home,
  MapPin,
  ArrowLeft,
  TreePine,
  Building2,
  CheckCircle,
  Loader2
} from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [village, setVillage] = useState('');
  const [area, setArea] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const org = searchParams.get('org') || 'gram_panchayat';
  const orgName = org === 'gram_panchayat' ? 'Gram Panchayat' : 'Mahanagar Palika';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await authApi.register({
        name,
        email,
        password,
        organization_type: org,
        village,
        area,
        role: 'citizen'
      });

      setSuccess('Registration successful! Redirecting to login...');

      setTimeout(() => {
        navigate(`/auth/login?org=${org}&role=citizen`);
      }, 1500);
    } catch (err: any) {
      console.error('Registration error:', err);

      let errorMessage = 'Registration failed. Please try again.';

      // FastAPI validation errors (422)
      if (err.response?.status === 422) {
        const details = err.response.data?.detail;
        if (Array.isArray(details)) {
          errorMessage = details
            .map((e: any) => `${e.loc?.slice(-1)[0]}: ${e.msg}`)
            .join(', ');
        }
      }
      // FastAPI HTTPException(detail="...")
      else if (typeof err.response?.data?.detail === 'string') {
        errorMessage = err.response.data.detail;
      }
      // Other backend formats
      else if (typeof err.response?.data?.message === 'string') {
        errorMessage = err.response.data.message;
      }
      // Axios / network error
      else if (typeof err.message === 'string') {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/auth/organization');
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
          Change Organization
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              org === 'gram_panchayat'
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {org === 'gram_panchayat' ? (
              <TreePine size={14} />
            ) : (
              <Building2 size={14} />
            )}
            <span className="font-medium">{orgName}</span>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-gray-900 mb-2">
              Register as Citizen
            </h1>
            <p className="text-gray-500">Join {orgName} as a citizen</p>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl shadow-gray-200 rounded-3xl border border-gray-100">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-xl flex items-start gap-2 text-sm">
                  <CheckCircle size={18} />
                  {success}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
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
                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Password */}
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
                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Village & Area */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Village (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                      <Home size={18} />
                    </div>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Area (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                      <MapPin size={18} />
                    </div>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3 rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 font-bold shadow-lg shadow-blue-100 transition"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  'Register Account'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm">
              Already have an account?{' '}
              <Link
                to={`/auth/login?org=${org}&role=citizen`}
                className="font-bold text-blue-600 hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
