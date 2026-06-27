import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { certificatesApi } from '../../api/certificates.api';
import { CertificateApplication, CertificateStatus } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import { AlertCircle, FileText, Calendar, User, CheckCircle, XCircle, ArrowLeft, Download, Paperclip, Eye } from 'lucide-react';

const CertificateApplicationDetail: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<CertificateApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetail();
    }
  }, [applicationId]);

  const fetchApplicationDetail = async () => {
    try {
      const response = await certificatesApi.getApplicationDetail(applicationId!);
      setApplication(response.data);
    } catch (error) {
      console.error('Error fetching application detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!application) return;
    
    setReviewing(true);
    try {
      const response = await certificatesApi.reviewApplication(applicationId!, {
        status: 'approved',
        admin_remarks: adminRemarks || 'Application approved'
      });
      setApplication(response.data);
      setShowReviewForm(false);
      setAdminRemarks('');
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Error approving application');
    } finally {
      setReviewing(false);
    }
  };

  const handleReject = async () => {
    if (!adminRemarks.trim()) {
      alert('Please provide remarks for rejection');
      return;
    }
    
    setReviewing(true);
    try {
      const response = await certificatesApi.reviewApplication(applicationId!, {
        status: 'rejected',
        admin_remarks: adminRemarks
      });
      setApplication(response.data);
      setShowReviewForm(false);
      setAdminRemarks('');
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Error rejecting application');
    } finally {
      setReviewing(false);
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
          onClick={() => navigate('/admin/certificates')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  // Parse form data
  let parsedFormData = {};
  try {
    parsedFormData = JSON.parse(application.form_data);
  } catch (e) {
    console.error('Error parsing form data:', e);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/certificates')}
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
          {/* Applicant Information */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="mr-2 text-blue-600" size={20} />
              Applicant Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{application.citizen_name || 'N/A'}</p>
              </div>
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
            </div>
          </div>

          {/* Application Data */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="mr-2 text-blue-600" size={20} />
              Application Details
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
                      onClick={() => handleDocumentDownload(doc.path)}
                    >
                      <Eye size={14} className="mr-1" />
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Remarks */}
          {application.admin_remarks && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Admin Remarks</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800">{application.admin_remarks}</p>
              </div>
            </div>
          )}

          {/* Certificate Download */}
          {application.status === CertificateStatus.APPROVED && application.certificate_path && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Download className="mr-2 text-green-600" size={20} />
                Generated Certificate
              </h2>
              <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">Certificate Generated</p>
                  <p className="text-sm text-green-600">Certificate Number: {application.certificate_number}</p>
                </div>
                <button 
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  onClick={() => {
                    // In a real implementation, this would download the certificate
                    window.open(application.certificate_path, '_blank');
                  }}
                >
                  Download Certificate
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Review Status */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Review Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <StatusBadge status={application.status} />
              </div>
              {application.reviewed_by && (
                <div>
                  <p className="text-sm text-gray-500">Reviewed By</p>
                  <p className="font-medium">Admin User</p>
                </div>
              )}
            </div>
          </div>

          {/* Review Actions */}
          {application.status === CertificateStatus.PENDING && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Review Application</h2>
              {!showReviewForm ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                  >
                    <CheckCircle size={18} className="mr-2" />
                    Review Application
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Remarks *
                    </label>
                    <textarea
                      id="remarks"
                      value={adminRemarks}
                      onChange={(e) => setAdminRemarks(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter remarks for the applicant..."
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleReject}
                      disabled={reviewing}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 transition flex items-center justify-center"
                    >
                      <XCircle size={18} className="mr-2" />
                      {reviewing ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={reviewing}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center"
                    >
                      <CheckCircle size={18} className="mr-2" />
                      {reviewing ? 'Processing...' : 'Approve'}
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setShowReviewForm(false);
                      setAdminRemarks('');
                    }}
                    className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateApplicationDetail;