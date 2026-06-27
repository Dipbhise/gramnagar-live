import React, { useEffect, useState } from 'react';
import { complaintsApi } from '../../api/complaints.api';
import { Complaint, ComplaintStatus } from '../../types';
import ComplaintCard from '../../components/ComplaintCard';
import { Search, Filter, Loader2, Inbox } from 'lucide-react';

const MyComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ComplaintStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await complaintsApi.getMyComplaints();
        setComplaints(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = complaints.filter(c => {
    const statusOk = filter === 'all' || c.status === filter;
    const searchOk =
      c.address.toLowerCase().includes(search.toLowerCase()) ||
      (c.village ?? '').toLowerCase().includes(search.toLowerCase());
    return statusOk && searchOk;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold">Your Complaints</h1>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              className="pl-10 pr-4 py-2 border rounded-xl"
              placeholder="Search location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="px-3 py-2 border rounded-xl"
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
          >
            <option value="all">All</option>
            <option value={ComplaintStatus.PENDING}>Pending</option>
            <option value={ComplaintStatus.ASSIGNED}>Assigned</option>
            <option value={ComplaintStatus.IN_PROGRESS}>In Progress</option>
            <option value={ComplaintStatus.COMPLETED}>Completed</option>
          </select>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <ComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border">
          <Inbox size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No complaints found</p>
        </div>
      )}
    </div>
  );
};

export default MyComplaints;
