
import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin.api';
import StatusBadge from '../../components/StatusBadge';
import { 
  MapPin, 
  Calendar, 
  User, 
  UserCheck, 
  Loader2, 
  AlertTriangle,
  ChevronDown,
  X,
  Image as ImageIcon
} from 'lucide-react';

interface Worker {
  id: number;
  name: string;
  email: string;
  village: string;
  area: string;
}

interface AdminComplaint {
  id: number;
  address: string;
  village: string;
  area: string;
  latitude: number;
  longitude: number;
  photo_path: string;
  completed_photo_path: string | null;
  status: string;
  citizen_id: number;
  citizen_name: string | null;
  worker_id: number | null;
  worker_name: string | null;
  created_at: string;
  completed_at: string | null;
}

const API_BASE = 'http://127.0.0.1:8000';

const AdminComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<AdminComplaint | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [complaintsRes, workersRes] = await Promise.all([
        adminApi.getAllComplaints(),
        adminApi.getWorkers()
      ]);
      setComplaints(complaintsRes.data);
      setWorkers(workersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (complaintId: number, workerId: number) => {
    try {
      setAssigningId(complaintId);
      await adminApi.assignWorker(String(complaintId), String(workerId));
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to assign worker');
    } finally {
      setAssigningId(null);
    }
  };

  const filtered = complaints.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'assigned': return 'bg-blue-500';
      case 'in_progress': return 'bg-indigo-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Complaints</h1>
          <p className="text-gray-500">{complaints.length} total complaints</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'assigned', 'in_progress', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: complaints.filter(c => c.status === 'pending').length, color: 'yellow' },
          { label: 'Assigned', value: complaints.filter(c => c.status === 'assigned').length, color: 'blue' },
          { label: 'In Progress', value: complaints.filter(c => c.status === 'in_progress').length, color: 'indigo' },
          { label: 'Completed', value: complaints.filter(c => c.status === 'completed').length, color: 'green' },
        ].map(stat => (
          <div key={stat.label} className={`bg-${stat.color}-50 p-4 rounded-2xl border border-${stat.color}-100`}>
            <p className={`text-${stat.color}-600 text-xs font-bold uppercase`}>{stat.label}</p>
            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Complaints Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border">
          <AlertTriangle size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No complaints found</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">ID</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Location</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Citizen</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Assigned To</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(complaint => (
                  <tr key={complaint.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-600">#{complaint.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-xs">
                        <MapPin size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{complaint.address}</p>
                          {(complaint.village || complaint.area) && (
                            <p className="text-xs text-gray-400 truncate">
                              {[complaint.village, complaint.area].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User size={14} className="text-gray-500" />
                        </div>
                        <span className="text-sm text-gray-700">{complaint.citizen_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td className="px-6 py-4">
                      {complaint.status === 'pending' ? (
                        <div className="relative">
                          <select
                            disabled={assigningId === complaint.id}
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssign(complaint.id, Number(e.target.value));
                              }
                            }}
                            className="appearance-none bg-blue-50 border border-blue-200 text-blue-700 pl-3 pr-8 py-2 rounded-xl text-sm font-medium cursor-pointer hover:bg-blue-100 transition disabled:opacity-50"
                            defaultValue=""
                          >
                            <option value="" disabled>Assign Worker</option>
                            {workers.map(w => (
                              <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
                        </div>
                      ) : complaint.worker_name ? (
                        <div className="flex items-center gap-2">
                          <UserCheck size={16} className="text-green-500" />
                          <span className="text-sm font-medium text-gray-700">{complaint.worker_name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Calendar size={14} />
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedComplaint(complaint)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-600 transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="sticky top-0 bg-white p-6 border-b flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Complaint #{selectedComplaint.id}</h2>
                <p className="text-sm text-gray-500">{selectedComplaint.address}</p>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedComplaint.status} />
                <span className="text-sm text-gray-500">
                  {new Date(selectedComplaint.created_at).toLocaleString()}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Citizen</p>
                  <p className="font-medium">{selectedComplaint.citizen_name || 'Unknown'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Assigned Worker</p>
                  <p className="font-medium">{selectedComplaint.worker_name || 'Not assigned'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Village</p>
                  <p className="font-medium">{selectedComplaint.village || '-'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Area</p>
                  <p className="font-medium">{selectedComplaint.area || '-'}</p>
                </div>
              </div>

              {/* Location */}
              <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-3">
                <MapPin className="text-blue-600" size={20} />
                <div>
                  <p className="text-sm font-medium text-blue-900">{selectedComplaint.address}</p>
                  <p className="text-xs text-blue-600">
                    {selectedComplaint.latitude.toFixed(6)}, {selectedComplaint.longitude.toFixed(6)}
                  </p>
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <ImageIcon size={16} /> Complaint Photo
                  </p>
                  <img
                    src={`${API_BASE}/${selectedComplaint.photo_path}`}
                    alt="Complaint"
                    className="rounded-xl border max-h-64 object-cover w-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    }}
                  />
                </div>

                {selectedComplaint.completed_photo_path && (
                  <div>
                    <p className="text-sm font-bold text-green-700 mb-2 flex items-center gap-2">
                      <ImageIcon size={16} /> Completion Proof
                    </p>
                    <img
                      src={`${API_BASE}/${selectedComplaint.completed_photo_path}`}
                      alt="Completion"
                      className="rounded-xl border max-h-64 object-cover w-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                      }}
                    />
                  </div>
                )}
              </div>

              {selectedComplaint.completed_at && (
                <div className="bg-green-50 p-4 rounded-xl text-center">
                  <p className="text-green-700 font-medium">
                    Completed on {new Date(selectedComplaint.completed_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
