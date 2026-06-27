import React from 'react';
import { CertificateType } from '../types';
import { FileText, ChevronRight } from 'lucide-react';

interface CertificateTypeCardProps {
  type: CertificateType;
  onClick: () => void;
}

const CertificateTypeCard: React.FC<CertificateTypeCardProps> = ({ type, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border p-4 hover:shadow-md transition cursor-pointer active:scale-[0.99]"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <FileText className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{type.display_name}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{type.description}</p>
          </div>
        </div>
        <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition" size={18} />
      </div>
    </div>
  );
};

export default CertificateTypeCard;