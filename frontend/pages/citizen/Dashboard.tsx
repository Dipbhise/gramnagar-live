import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { complaintsApi } from '../../api/complaints.api';
import { schemesApi } from '../../api/schemes.api';
import { Complaint, Scheme } from '../../types';
import ComplaintCard from '../../components/ComplaintCard';
import { Plus, BookOpen, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

const CitizenDashboard: React.FC = () => {
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [complaintsRes, schemesRes] = await Promise.all([
          complaintsApi.getMyComplaints(),
          schemesApi.getAll(),
        ]);

        // ✅ latest 3 complaints
        setRecentComplaints(complaintsRes.data.slice(0, 3));
        setSchemes(schemesRes.data.slice(0, 2));
      } catch (err) {
        console.error('Dashboard load failed', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-blue-600 mb-2" />
        <p className="text-gray-500">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <h2 className="text-2xl font-bold mb-2">Help improve your city</h2>
        <p className="text-blue-100 mb-6 max-w-md">
          Report issues directly to the municipal council.
        </p>
        <Link
          to="/citizen/submit"
          className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-md hover:bg-blue-50 transition"
        >
          <Plus size={20} className="mr-2" />
          File New Complaint
        </Link>
      </section>

      {/* Recent Complaints */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Recent Complaints</h3>
          <Link to="/citizen/complaints" className="text-sm font-bold text-blue-600">
            View All →
          </Link>
        </div>

        {recentComplaints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentComplaints.map(c => (
              <ComplaintCard
                key={c.id}
                complaint={c}
                onClick={() => navigate(`/citizen/complaints/${c.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed rounded-2xl p-8 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No complaints yet</p>
          </div>
        )}
      </section>

      {/* Schemes */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Government Schemes</h3>
          <Link to="/schemes" className="text-sm font-bold text-blue-600">
            Browse All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schemes.map(s => (
            <div key={s.id} className="bg-white p-5 rounded-2xl border hover:border-blue-300 transition">
              <h4 className="font-bold mb-1">{s.title}</h4>
              <p className="text-sm text-gray-500 line-clamp-2">{s.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CitizenDashboard;
