
import React, { useState, useEffect } from 'react';
import { workerApi } from '../../api/worker.api';
import StatusBadge from '../../components/StatusBadge';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  Play, 
  Loader2, 
  Camera, 
  Inbox,
  Image as ImageIcon,
  X
} from 'lucide-react';

interface WorkerTask {
  id: number;
  address: string;
  village: string;
  area: string;
  latitude: number;
  longitude: number;
  photo_path: string;
  status: string;
  created_at: string;
}

const API_BASE = 'http://127.0.0.1:8000';

const WorkerDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<WorkerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<WorkerTask | null>(null);
  const [completionFile, setCompletionFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewingTask, setViewingTask] = useState<WorkerTask | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await workerApi.getAssigned();
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (id: number) => {
    try {
      setIsUpdating(true);
      await workerApi.startWork(String(id));
      await fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to start work');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask || !completionFile) return;

    try {
      setIsUpdating(true);
      const formData = new FormData();
      formData.append('photo', completionFile);
      await workerApi.completeWork(String(activeTask.id), formData);
      setActiveTask(null);
      setCompletionFile(null);
      await fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to complete work');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-500">
            {tasks.length === 0 
              ? 'No active assignments' 
              : `You have ${tasks.length} active assignment${tasks.length > 1 ? 's' : ''}`
            }
          </p>
        </div>
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
          <Clock size={24} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <p className="text-blue-600 text-xs font-bold uppercase">Assigned</p>
          <p className="text-2xl font-black text-gray-900">
            {tasks.filter(t => t.status === 'assigned').length}
          </p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
          <p className="text-indigo-600 text-xs font-bold uppercase">In Progress</p>
          <p className="text-2xl font-black text-gray-900">
            {tasks.filter(t => t.status === 'in_progress').length}
          </p>
        </div>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
          <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No tasks assigned to you yet</p>
          <p className="text-gray-400 text-sm mt-1">Check back later for new assignments</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <StatusBadge status={task.status} />
                <span className="text-xs font-mono text-gray-400">#{task.id}</span>
              </div>

              {/* Location */}
              <div>
                <h3 className="font-bold text-gray-900 line-clamp-1">{task.address}</h3>
                {(task.village || task.area) && (
                  <p className="text-sm text-gray-500 mt-1">
                    {[task.village, task.area].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>

              {/* GPS Info */}
              <div className="flex items-center text-xs text-gray-400 bg-gray-50 p-3 rounded-xl">
                <MapPin size={14} className="mr-2 text-blue-500 flex-shrink-0" />
                <span className="truncate">
                  {task.latitude.toFixed(4)}, {task.longitude.toFixed(4)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {task.status === 'assigned' && (
                  <button 
                    onClick={() => handleStart(task.id)}
                    disabled={isUpdating}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center hover:bg-blue-700 active:scale-95 transition disabled:opacity-50"
                  >
                    <Play size={16} className="mr-2" /> Start Work
                  </button>
                )}
                {task.status === 'in_progress' && (
                  <button 
                    onClick={() => setActiveTask(task)}
                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-sm flex items-center justify-center hover:bg-green-700 active:scale-95 transition"
                  >
                    <CheckCircle size={16} className="mr-2" /> Mark Complete
                  </button>
                )}
                <button 
                  onClick={() => setViewingTask(task)}
                  className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {viewingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="sticky top-0 bg-white p-6 border-b flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Task #{viewingTask.id}</h2>
                <StatusBadge status={viewingTask.status} />
              </div>
              <button
                onClick={() => setViewingTask(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Address */}
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-xs text-blue-600 uppercase font-bold mb-1">Location</p>
                <p className="font-medium text-blue-900">{viewingTask.address}</p>
                {(viewingTask.village || viewingTask.area) && (
                  <p className="text-sm text-blue-700 mt-1">
                    {[viewingTask.village, viewingTask.area].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>

              {/* GPS */}
              <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                <MapPin className="text-gray-500" size={20} />
                <span className="text-sm text-gray-600">
                  {viewingTask.latitude.toFixed(6)}, {viewingTask.longitude.toFixed(6)}
                </span>
              </div>

              {/* Photo */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <ImageIcon size={16} /> Complaint Photo
                </p>
                <img
                  src={`${API_BASE}/${viewingTask.photo_path}`}
                  alt="Complaint"
                  className="rounded-xl border max-h-64 object-cover w-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                  }}
                />
              </div>

              {/* Date */}
              <p className="text-sm text-gray-400 text-center">
                Received: {new Date(viewingTask.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-scaleUp">
            <h2 className="text-xl font-bold mb-2 text-gray-900">Complete Task #{activeTask.id}</h2>
            <p className="text-sm text-gray-500 mb-6">
              Upload a photo of the completed work for verification.
            </p>
            
            <form onSubmit={handleComplete} className="space-y-4">
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition cursor-pointer ${
                  completionFile ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => document.getElementById('proof-input')?.click()}
              >
                {completionFile ? (
                  <>
                    <CheckCircle className="text-green-500 mb-2" size={32} />
                    <span className="text-sm font-bold text-green-700">Photo Selected</span>
                    <span className="text-xs text-green-600 mt-1 max-w-full truncate px-4">
                      {completionFile.name}
                    </span>
                  </>
                ) : (
                  <>
                    <Camera className="text-gray-400 mb-2" size={32} />
                    <span className="text-sm font-medium text-gray-500">
                      Click to upload proof photo
                    </span>
                  </>
                )}
                <input 
                  id="proof-input"
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => setCompletionFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setActiveTask(null);
                    setCompletionFile(null);
                  }}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!completionFile || isUpdating}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-100 disabled:opacity-50 flex items-center justify-center transition hover:bg-green-700"
                >
                  {isUpdating ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    'Submit & Complete'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
