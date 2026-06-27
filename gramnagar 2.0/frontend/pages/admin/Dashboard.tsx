
import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin.api';
import { schemesApi } from '../../api/schemes.api';
import { Complaint, ComplaintStatus } from '../../types';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getAllComplaints();
        const data: Complaint[] = res.data;
        setStats({
          total: data.length,
          pending: data.filter(c => c.status === ComplaintStatus.PENDING).length,
          assigned: data.filter(c => c.status === ComplaintStatus.ASSIGNED || c.status === ComplaintStatus.IN_PROGRESS).length,
          completed: data.filter(c => c.status === ComplaintStatus.COMPLETED).length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Pending', value: stats.pending, color: '#EAB308' },
    { name: 'Working', value: stats.assigned, color: '#3B82F6' },
    { name: 'Completed', value: stats.completed, color: '#22C55E' },
  ];

  const StatBox = ({ label, value, icon, color, trend }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <h4 className="text-3xl font-black text-gray-900">{value}</h4>
        {trend && (
          <div className="flex items-center text-green-500 text-xs font-bold mt-2">
            <TrendingUp size={12} className="mr-1" /> {trend}% this week
          </div>
        )}
      </div>
      <div className={`p-3 rounded-2xl ${color}`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Admin Overview</h1>
          <p className="text-gray-500">Municipal Operations Control Panel</p>
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map(i => (
            <img key={i} src={`https://picsum.photos/seed/${i+10}/40/40`} className="w-10 h-10 rounded-full border-2 border-white" alt="Team" />
          ))}
          <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-400">+12</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBox 
          label="Total Reports" 
          value={stats.total} 
          icon={<AlertTriangle className="text-yellow-600" size={24} />}
          color="bg-yellow-50"
          trend="12"
        />
        <StatBox 
          label="Pending Action" 
          value={stats.pending} 
          icon={<Clock className="text-orange-600" size={24} />}
          color="bg-orange-50"
        />
        <StatBox 
          label="Active Jobs" 
          value={stats.assigned} 
          icon={<BarChart3 className="text-blue-600" size={24} />}
          color="bg-blue-50"
          trend="5"
        />
        <StatBox 
          label="Resolved" 
          value={stats.completed} 
          icon={<CheckCircle className="text-green-600" size={24} />}
          color="bg-green-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="mr-2 text-blue-600" size={20} />
            Resolution Distribution
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-3xl text-white shadow-lg shadow-indigo-100 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
            <p className="text-indigo-100 text-sm mb-8">Manage city resources and community outreach programs.</p>
            
            <div className="space-y-3">
              <button className="w-full p-4 bg-white/10 hover:bg-white/20 transition rounded-2xl flex items-center justify-between group">
                <div className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-lg mr-3"><Users size={18} /></div>
                  <span className="font-bold">Assign Workers</span>
                </div>
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button className="w-full p-4 bg-white/10 hover:bg-white/20 transition rounded-2xl flex items-center justify-between group">
                <div className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-lg mr-3"><CheckCircle size={18} /></div>
                  <span className="font-bold">Approve Proofs</span>
                </div>
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-bold text-indigo-100 uppercase tracking-widest">System Status: Optimal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
