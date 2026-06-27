
import React from 'react';
import { ComplaintStatus } from '../types';
import { STATUS_COLORS } from '../constants';

interface StatusBadgeProps {
  status: ComplaintStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const formattedStatus = status.replace('_', ' ');
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wide ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {formattedStatus}
    </span>
  );
};

export default StatusBadge;
