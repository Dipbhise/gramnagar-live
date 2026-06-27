import React, { useState, useEffect } from 'react';
import { certificatesApi } from '../../api/certificates.api';
import { CertificateApplicationListItem, CertificateStatus } from '../../types';
import CertificateApplicationCard from '../../components/CertificateApplicationCard';
import { FileText, Clock, CheckCircle, XCircle, Eye, Filter } from 'lucide-react';

const AdminCertificates: React.FC = () => {
  const [applications, setApplications] = useState<CertificateApplicationListItem[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<CertificateApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await certificatesApi.getAllApplications();
        setApplications(response.data);
        setFilteredApplications(response.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === filter));
    }
  }, [filter, applications]);

  const getStatusCounts = () => {
    const counts: Record<string, number> = {
      all: applications.length,
      pending: applications.filter(a => a.status === CertificateStatus.PENDING).length,
      under_review: applications.filter(a => a.status === CertificateStatus.UNDER_REVIEW).length,
      approved: applications.filter(a => a.status === CertificateStatus.APPROVED).length,
      rejected: applications.filter(a => a.status === CertificateStatus.REJECTED).length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

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
        <h1 className="text-2xl font-bold text-gray-900">Certificate Applications</h1>
        <p className="text-gray-600">Manage citizen certificate applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border text-center">
          <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-xl border text-center">
          <div className="text-2xl font-bold text-yellow-700">{statusCounts.pending}</div>
          <div className="text-xs text-yellow-600">Pending</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border text-center">
          <div className="text-2xl font-bold text-blue-700">{statusCounts.under_review}</div>
          <div className="text-xs text-blue-600">Review</div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border text-center">
          <div className="text-2xl font-bold text-green-700">{statusCounts.approved}</div>
          <div className="text-xs text-green-600">Approved</div>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border text-center">
          <div className="text-2xl font-bold text-red-700">{statusCounts.rejected}</div>
          <div className="text-xs text-red-600">Rejected</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <Filter size={18} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All', count: statusCounts.all },
            { key: 'pending', label: 'Pending', count: statusCounts.pending },
            { key: 'under_review', label: 'Under Review', count: statusCounts.under_review },
            { key: 'approved', label: 'Approved', count: statusCounts.approved },
            { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === key
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <section>
        {filteredApplications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApplications.map(app => (
              <CertificateApplicationCard
                key={app.id}
                application={app}
                isAdminView={true}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border p-8 text-center">
            <FileText className="mx-auto text-gray-400 mb-3" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No applications found</h3>
            <p className="text-gray-500">There are no certificate applications matching your filter.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminCertificates;