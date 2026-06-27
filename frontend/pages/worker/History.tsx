
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  Inbox,
  Image as ImageIcon,
  X,
  Clock
} from 'lucide-react';

import { workerApi } from '../../api/worker.api';

interface CompletedTask {
  id: number;
  address: string;
  village: string;
  area: string;
  photo_path: string;
  completed_photo_path: string;
  created_at: string;
  completed_at: string;
}

const API_BASE = 'http://127.0.0.1:8000';

const WorkerHistory: React.FC = () => {
  const [tasks, setTasks] = useState<CompletedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<CompletedTask | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await workerApi.getHistory();
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <h1 className="text-2xl font-bold text-gray-900">Completed Tasks</h1>
          <p className="text-gray-500">
            {tasks.length === 0 
              ? 'No completed tasks yet' 
              : `${tasks.length} task${tasks.length > 1 ? 's' : ''} completed`
            }
          </p>
        </div>
        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
          <CheckCircle2 size={24} />
        </div>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
          <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No completed tasks yet</p>
          <p className="text-gray-400 text-sm mt-1">Complete your assigned tasks to see them here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <div 
              key={task.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedTask(task)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">
                      COMPLETED
                    </span>
                    <span className="text-xs font-mono text-gray-400">#{task.id}</span>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 truncate">{task.address}</h3>
                  
                  {(task.village || task.area) && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin size={12} />
                      {[task.village, task.area].filter(Boolean).join(', ')}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      Received: {formatDate(task.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-green-500" />
                      Completed: {formatDate(task.completed_at)}
                    </div>
                  </div>
                </div>

                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img 
                    src={`${API_BASE}/${task.completed_photo_path}`}
                    alt="Proof"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=...';
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="sticky top-0 bg-white p-6 border-b flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Task #{selectedTask.id}</h2>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">
                  COMPLETED
                </span>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Location */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Location</p>
                <p className="font-medium text-gray-900">{selectedTask.address}</p>
                {(selectedTask.village || selectedTask.area) && (
                  <p className="text-sm text-gray-500 mt-1">
                    {[selectedTask.village, selectedTask.area].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-xs text-blue-600 uppercase font-bold mb-1">Received</p>
                  <p className="font-medium text-blue-900 text-sm">{formatDateTime(selectedTask.created_at)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-xs text-green-600 uppercase font-bold mb-1">Completed</p>
                  <p className="font-medium text-green-900 text-sm">{formatDateTime(selectedTask.completed_at)}</p>
                </div>
              </div>

              {/* Original Photo */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <ImageIcon size={16} /> Original Complaint
                </p>
                <img
                  src={`${API_BASE}/${selectedTask.photo_path}`}
                  alt="Complaint"
                  className="rounded-xl border max-h-48 object-cover w-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                  }}
                />
              </div>

              {/* Completion Photo */}
              <div>
                <p className="text-sm font-bold text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Completion Proof
                </p>
                <img
                  src={`${API_BASE}/${selectedTask.completed_photo_path}`}
                  alt="Proof"
                  className="rounded-xl border max-h-48 object-cover w-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerHistory;
