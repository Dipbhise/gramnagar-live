
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workerApi } from '../../api/worker.api';
import { useAuth } from '../../auth/AuthContext';
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Loader2,
  ListTodo,
  History
} from 'lucide-react';

interface WorkerStats {
  profile: {
    id: number;
    name: string;
    email: string;
    village: string;
    area: string;
  };
  stats: {
    assigned: number;
    in_progress: number;
    completed: number;
    total: number;
  };
}

const WorkerOverview: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<WorkerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await workerApi.getStats();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const stats = data?.stats;
  const profile = data?.profile;
  const activeTasks = (stats?.assigned || 0) + (stats?.in_progress || 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-lg shadow-blue-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
            {profile?.name?.charAt(0).toUpperCase() || 'W'}
          </div>
          <div>
            <p className="text-blue-100 text-sm">Welcome back,</p>
            <h1 className="text-2xl font-bold">{profile?.name || user?.name || 'Worker'}</h1>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-blue-200" />
            <span>{profile?.email}</span>
          </div>
          {(profile?.village || profile?.area) && (
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-200" />
              <span>{[profile?.village, profile?.area].filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase">Total Assigned</span>
            <Briefcase size={18} className="text-gray-400" />
          </div>
          <p className="text-3xl font-black text-gray-900">{stats?.total || 0}</p>
        </div>

        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-600 uppercase">Pending</span>
            <Clock size={18} className="text-blue-500" />
          </div>
          <p className="text-3xl font-black text-gray-900">{stats?.assigned || 0}</p>
        </div>

        <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-indigo-600 uppercase">In Progress</span>
            <TrendingUp size={18} className="text-indigo-500" />
          </div>
          <p className="text-3xl font-black text-gray-900">{stats?.in_progress || 0}</p>
        </div>

        <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-green-600 uppercase">Completed</span>
            <CheckCircle2 size={18} className="text-green-500" />
          </div>
          <p className="text-3xl font-black text-gray-900">{stats?.completed || 0}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          to="/worker/tasks"
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <ListTodo size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Active Tasks</h3>
              <p className="text-sm text-gray-500">
                {activeTasks === 0 
                  ? 'No active tasks' 
                  : `${activeTasks} task${activeTasks > 1 ? 's' : ''} waiting`
                }
              </p>
            </div>
          </div>
          <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
        </Link>

        <Link 
          to="/worker/history"
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <History size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Task History</h3>
              <p className="text-sm text-gray-500">
                {stats?.completed === 0 
                  ? 'No completed tasks yet' 
                  : `${stats?.completed} task${(stats?.completed || 0) > 1 ? 's' : ''} completed`
                }
              </p>
            </div>
          </div>
          <ArrowRight size={20} className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition" />
        </Link>
      </div>

      {/* Performance Card */}
      {(stats?.total || 0) > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Performance Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-bold text-gray-900">
                  {Math.round(((stats?.completed || 0) / (stats?.total || 1)) * 100)}%
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${((stats?.completed || 0) / (stats?.total || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-black text-blue-600">{stats?.assigned || 0}</p>
                <p className="text-xs text-gray-500">Waiting</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-indigo-600">{stats?.in_progress || 0}</p>
                <p className="text-xs text-gray-500">Working</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-green-600">{stats?.completed || 0}</p>
                <p className="text-xs text-gray-500">Done</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerOverview;
