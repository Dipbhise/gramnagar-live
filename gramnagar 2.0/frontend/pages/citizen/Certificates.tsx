import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { certificatesApi } from '../../api/certificates.api';
import { CertificateType, CertificateApplicationListItem, CertificateStatus } from '../../types';
import CertificateTypeCard from '../../components/CertificateTypeCard';
import CertificateApplicationCard from '../../components/CertificateApplicationCard';
import { FileText, Plus, Download, Clock, CheckCircle, XCircle } from 'lucide-react';

const CitizenCertificates: React.FC = () => {
  const [certificateTypes, setCertificateTypes] = useState<CertificateType[]>([]);
  const [myApplications, setMyApplications] = useState<CertificateApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, appsRes] = await Promise.all([
          certificatesApi.getCertificateTypes(),
          certificatesApi.getMyApplications(),
        ]);
        setCertificateTypes(typesRes.data);
        setMyApplications(appsRes.data);
      } catch (error) {
        console.error('Error fetching certificate data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApplyForCertificate = (type: CertificateType) => {
    navigate(`/citizen/certificates/apply/${type.id}`);
  };

  const handleDownloadCertificate = (applicationId: string) => {
    certificatesApi.downloadCertificate(applicationId)
      .then(response => {
        // In a real implementation, you'd download the actual certificate file
        alert(`Certificate download initiated for application: ${applicationId}`);
      })
      .catch(error => {
        console.error('Error downloading certificate:', error);
        alert('Error downloading certificate');
      });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case CertificateStatus.PENDING:
        return <Clock className="text-yellow-500" size={16} />;
      case CertificateStatus.UNDER_REVIEW:
        return <Clock className="text-blue-500" size={16} />;
      case CertificateStatus.APPROVED:
        return <CheckCircle className="text-green-500" size={16} />;
      case CertificateStatus.REJECTED:
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
        <p className="text-gray-600">Apply for government certificates by selecting a certificate type below</p>
      </div>

      {/* Available Certificate Types */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Certificates</h2>
        {certificateTypes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificateTypes.map(type => (
              <CertificateTypeCard
                key={type.id}
                type={type}
                onClick={() => handleApplyForCertificate(type)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border p-8 text-center">
            <FileText className="mx-auto text-gray-400 mb-3" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No certificates available</h3>
            <p className="text-gray-500">Please check back later for available certificate types.</p>
          </div>
        )}
      </section>

      {/* My Applications */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">My Applications</h2>
        {myApplications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myApplications.map(app => (
              <CertificateApplicationCard
                key={app.id}
                application={app}
                onDownload={() => handleDownloadCertificate(app.id)}
                showDownload={app.status === CertificateStatus.APPROVED}
                isCitizenView={true}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border p-8 text-center">
            <FileText className="mx-auto text-gray-400 mb-3" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No applications yet</h3>
            <p className="text-gray-500">Apply for a certificate to see it here.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default CitizenCertificates;