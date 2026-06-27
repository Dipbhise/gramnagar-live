import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintsApi } from '../../api/complaints.api';
import { Complaint } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000'; // Using constant instead of import.meta.env

const ComplaintDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    if (!id) return;

    complaintsApi
      .getById(Number(id))
      .then((res) => setComplaint(res.data))
      .catch(() => navigate('/citizen/complaints'));
  }, [id, navigate]);

  if (!complaint) {
    return (
      <p className="text-center text-gray-500 mt-10">Loading complaint…</p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 font-bold"
      >
        <ArrowLeft size={18} className="mr-1" /> Back
      </button>

      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <StatusBadge status={complaint.status} />
          <div className="text-xs text-gray-400 flex items-center">
            <Calendar size={14} className="mr-1" />
            {new Date(complaint.created_at).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center text-gray-600">
          <MapPin size={16} className="mr-1" />
          {complaint.address}
        </div>

        {/* 📸 Submitted Photo */}
        <div>
          <p className="text-sm text-gray-500 mb-1">Submitted Photo</p>
          <img
            src={`${API_BASE_URL}/${complaint.photo_path}`}
            alt="Complaint"
            className="rounded-xl border max-h-72 object-cover w-full"
          />
        </div>

        {/* ✅ Completion Photo (if any) */}
        {complaint.status === 'completed' && complaint.completed_photo_path && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Completion Photo</p>
            <img
              src={`${API_BASE_URL}/${complaint.completed_photo_path}`}
              alt="Completed"
              className="rounded-xl border max-h-72 object-cover w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintDetails;
