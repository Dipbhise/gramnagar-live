import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CertificateApplicationListItem, CertificateStatus } from '../types';
import StatusBadge from './StatusBadge';
import { FileText, Calendar, Download, Eye } from 'lucide-react';

interface CertificateApplicationCardProps {
  application: CertificateApplicationListItem;
  onDownload?: () => void;
  showDownload?: boolean;
  isAdminView?: boolean;
  isCitizenView?: boolean;
}

const CertificateApplicationCard: React.FC<CertificateApplicationCardProps> = ({
  application,
  onDownload,
  showDownload = false,
  isAdminView = false,
  isCitizenView = false,
}) => {
  const navigate = useNavigate();
  const date = new Date(application.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload();
    }
  };

  const handleClick = () => {
    if (isAdminView) {
      navigate(`/admin/certificates/${application.id}`);
    } else if (isCitizenView) {
      navigate(`/citizen/certificates/application/${application.id}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`bg-white rounded-xl border p-4 hover:shadow-md transition cursor-pointer active:scale-[0.99] ${
        isAdminView || isCitizenView ? 'hover:shadow-lg' : ''
      }`}
    >
      <div className="flex justify-between mb-2">
        <StatusBadge status={application.status} />
        <div className="text-xs text-gray-400 flex items-center">
          <Calendar size={14} className="mr-1" />
          {date}
        </div>
      </div>

      <p className="text-sm text-gray-800 font-semibold truncate">
        {application.certificate_type_name}
      </p>
      <p className="text-xs text-gray-500 mt-1">ID: {application.application_number || 'N/A'}</p>

      <div className="flex justify-between items-center pt-3 border-t mt-3">
        <div className="flex items-center text-xs text-gray-400">
          <FileText size={14} className="mr-1" />
          {application.citizen_name || 'Applicant'}
        </div>

        <div className="flex items-center space-x-2">
          {showDownload && application.status === CertificateStatus.APPROVED && (
            <button
              onClick={handleDownload}
              className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium"
            >
              <Download size={14} className="mr-1" />
              Download
            </button>
          )}
          
          {(isAdminView || isCitizenView) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isAdminView) {
                  navigate(`/admin/certificates/${application.id}`);
                } else if (isCitizenView) {
                  navigate(`/citizen/certificates/application/${application.id}`);
                }
              }}
              className="flex items-center text-gray-600 hover:text-gray-800 text-xs font-medium"
            >
              <Eye size={14} className="mr-1" />
              View
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateApplicationCard;