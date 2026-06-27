import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { certificatesApi } from '../../api/certificates.api';
import { CertificateApplication, CertificateStatus } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import { AlertCircle, FileText, Calendar, User, ArrowLeft, Download, Paperclip, Eye, AlertTriangle } from 'lucide-react';

const CertificateApplicationDetail: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<CertificateApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetail();
    }
  }, [applicationId]);

  const fetchApplicationDetail = async () => {
    try {
      const response = await certificatesApi.getApplicationById(applicationId!);
      setApplication(response.data);
    } catch (error) {
      console.error('Error fetching application detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (application?.certificate_path) {
      // In a real implementation, this would trigger the actual file download
      window.open(application.certificate_path, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDocumentDownload = async (docPath: string) => {
    try {
      const filename = docPath.split('/').pop();
      if (!filename) return;
      
      // Get the token from localStorage
      const token = localStorage.getItem('civic_token');
      
      // Fetch the document with authentication
      const response = await fetch(`http://127.0.0.1:8000/certificates/download-document/${filename}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download document');
      }
      
      // Create a blob from the response and open it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename; // Set the filename for download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document');
    }
  };

  // Parse supporting documents - they are stored as JSON array of file paths
  let parsedDocuments = [];
  try {
    if (application?.supporting_documents) {
      const rawDocs = JSON.parse(application.supporting_documents);
      // Convert file paths to document objects with name and path
      parsedDocuments = rawDocs.map((path: string, index: number) => ({
        name: path.split('/').pop() || `Document ${index + 1}`,
        path: path,
        size: '' // Size would be calculated if needed
      }));
    }
  } catch (e) {
    console.error('Error parsing supporting documents:', e);
    // If parsing fails, treat as single file path
    if (application?.supporting_documents) {
      parsedDocuments = [{
        name: application.supporting_documents.split('/').pop() || 'Document',
        path: application.supporting_documents,
        size: ''
      }];
    }
  }

  // Parse form data
  let parsedFormData = {};
  try {
    parsedFormData = JSON.parse(application?.form_data || '{}');
  } catch (e) {
    console.error('Error parsing form data:', e);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-3" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Application not found</h3>
        <p className="text-gray-500">The requested application does not exist.</p>
        <button
          onClick={() => navigate('/citizen/certificates')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Back to Certificates
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/citizen/certificates')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Applications
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
            <p className="text-gray-600">ID: {application.application_number || 'N/A'}</p>
          </div>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Status Banner */}
          <div className={`rounded-xl border p-6 ${
            application.status === CertificateStatus.APPROVED 
              ? 'bg-green-50 border-green-200' 
              : application.status === CertificateStatus.REJECTED 
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center">
              {application.status === CertificateStatus.APPROVED && (
                <Download className="text-green-600 mr-3" size={24} />
              )}
              {application.status === CertificateStatus.REJECTED && (
                <AlertTriangle className="text-red-600 mr-3" size={24} />
              )}
              {application.status === CertificateStatus.PENDING && (
                <FileText className="text-yellow-600 mr-3" size={24} />
              )}
              <div>
                <h2 className="text-lg font-semibold">
                  {application.status === CertificateStatus.APPROVED && 'Certificate Approved!'}
                  {application.status === CertificateStatus.REJECTED && 'Application Rejected'}
                  {application.status === CertificateStatus.PENDING && 'Application Under Review'}
                </h2>
                <p className="text-sm">
                  {application.status === CertificateStatus.APPROVED && 'Your certificate is ready for download'}
                  {application.status === CertificateStatus.REJECTED && 'Your application was not approved'}
                  {application.status === CertificateStatus.PENDING && 'Your application is being reviewed'}
                </p>
              </div>
            </div>
          </div>

          {/* Applicant Information */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="mr-2 text-blue-600" size={20} />
              Application Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Certificate Type</p>
                <p className="font-medium">{application.certificate_type_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Application Date</p>
                <p className="font-medium">{formatDate(application.created_at)}</p>
              </div>
              {application.reviewed_at && (
                <div>
                  <p className="text-sm text-gray-500">Reviewed Date</p>
                  <p className="font-medium">{formatDate(application.reviewed_at)}</p>
                </div>
              )}
              {application.approved_at && (
                <div>
                  <p className="text-sm text-gray-500">Approved Date</p>
                  <p className="font-medium">{formatDate(application.approved_at)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Application Data */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="mr-2 text-blue-600" size={20} />
              Submitted Information
            </h2>
            <div className="space-y-3">
              {Object.entries(parsedFormData).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="text-gray-900">{value as string}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supporting Documents */}
          {parsedDocuments.length > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Paperclip className="mr-2 text-blue-600" size={20} />
                Supporting Documents
              </h2>
              <div className="space-y-3">
                {parsedDocuments.map((doc: any, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="text-gray-400 mr-2" size={16} />
                      <span className="text-gray-800">{doc.name}</span>
                    </div>
                    <button 
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDocumentDownload(doc.path);
                      }}
                    >
                      <Eye size={14} className="mr-1" />
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Remarks/Reason */}
          {application.admin_remarks && (
            <div className={`rounded-xl border p-6 ${
              application.status === CertificateStatus.REJECTED 
                ? 'bg-red-50 border-red-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                {application.status === CertificateStatus.REJECTED ? (
                  <AlertTriangle className="mr-2 text-red-600" size={20} />
                ) : (
                  <FileText className="mr-2 text-blue-600" size={20} />
                )}
                {application.status === CertificateStatus.REJECTED ? 'Rejection Reason' : 'Admin Remarks'}
              </h2>
              <div className={`p-4 rounded-lg ${
                application.status === CertificateStatus.REJECTED 
                  ? 'bg-red-100' 
                  : 'bg-blue-100'
              }`}>
                <p className={`${
                  application.status === CertificateStatus.REJECTED 
                    ? 'text-red-800' 
                    : 'text-blue-800'
                }`}>
                  {application.admin_remarks}
                </p>
              </div>
              {application.status === CertificateStatus.REJECTED && (
                <p className="text-sm text-gray-600 mt-3">
                  You can reapply for this certificate after addressing the mentioned issues.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Certificate Actions */}
          {application.status === CertificateStatus.APPROVED && application.certificate_path && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Download className="mr-2 text-green-600" size={20} />
                Download Certificate
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-medium text-green-800">Certificate Ready</p>
                  <p className="text-sm text-green-600 mt-1">
                    Certificate Number: {application.certificate_number}
                  </p>
                </div>
                <button
                  onClick={handleDownloadCertificate}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                >
                  <Download size={18} className="mr-2" />
                  Download Certificate
                </button>
              </div>
            </div>
          )}

          {/* Application Status Info */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Application Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current Status</span>
                <StatusBadge status={application.status} />
              </div>
              
              {application.status === CertificateStatus.PENDING && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Your application is currently under review. Please check back later for updates.
                  </p>
                </div>
              )}
              
              {application.status === CertificateStatus.UNDER_REVIEW && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Your application is being processed. This may take a few days.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateApplicationDetail;