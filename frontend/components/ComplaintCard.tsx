import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Complaint } from '../types';
import StatusBadge from './StatusBadge';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';

interface ComplaintCardProps {
  complaint: Complaint;
  showAction?: boolean;
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  showAction = true,
}) => {
  const navigate = useNavigate();

  const date = new Date(complaint.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleClick = () => {
    navigate(`/citizen/complaints/${complaint.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl border p-4 hover:shadow-md transition cursor-pointer active:scale-[0.99]"
    >
      <div className="flex justify-between mb-2">
        <StatusBadge status={complaint.status} />
        <div className="text-xs text-gray-400 flex items-center">
          <Calendar size={14} className="mr-1" />
          {date}
        </div>
      </div>

      <p className="text-sm text-gray-800 font-semibold truncate">
        Complaint #{complaint.id}
      </p>

      <div className="flex justify-between items-center pt-3 border-t mt-3">
        <div className="flex items-center text-xs text-gray-400 max-w-[80%] truncate">
          <MapPin size={14} className="mr-1 shrink-0" />
          <span className="truncate">
            {complaint.address || 'GPS location'}
          </span>
        </div>

        {showAction && (
          <ChevronRight
            size={18}
            className="text-gray-300 group-hover:text-blue-500 transition"
          />
        )}
      </div>
    </div>
  );
};

export default ComplaintCard;
