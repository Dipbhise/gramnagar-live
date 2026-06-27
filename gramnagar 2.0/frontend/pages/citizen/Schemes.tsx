
import React, { useState, useEffect } from 'react';
import { schemesApi } from '../../api/schemes.api';
import { 
  BookOpen, 
  Loader2, 
  Calendar, 
  Users, 
  Gift,
  ChevronDown,
  ChevronUp,
  Search,
  Inbox,
  FileText,
  Download
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

interface Scheme {
  id: number;
  title: string;
  description: string;
  eligibility: string;
  benefits: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  gr_pdf_path: string | null;
  created_at: string;
  organization_id: number;
  organization_name: string | null;
}

const CitizenSchemes: React.FC = () => {
  const { organizationName, token } = useAuth();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    console.debug('[CitizenSchemes] useEffect - token:', token, 'organizationName:', organizationName);
    loadSchemes();
  }, [token, organizationName]);

  const loadSchemes = async () => {
    try {
      setLoading(true);
      const res = await schemesApi.getAll();
      console.debug('[CitizenSchemes] loadSchemes - fetched', Array.isArray(res.data) ? res.data.length : 'N/A');
      setSchemes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const filtered = schemes.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  // DEBUG: visible info to help confirm auth/org/token changes on the page
  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const downloadPdf = (pdfPath: string, schemeTitle: string) => {
    const link = document.createElement('a');
    link.href = `/${pdfPath}`;
    link.download = `${schemeTitle}-GR.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 rounded-3xl text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={28} />
          <div>
            <h1 className="text-2xl font-bold">Government Schemes</h1>
            <p className="text-xs text-green-200">{}</p>
          </div>
        </div>
        <p className="text-green-100 mb-4">
          Explore various government welfare schemes available for citizens
        </p>
        
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schemes..."
            className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-green-200 focus:bg-white/20 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Schemes</p>
          <p className="text-2xl font-black text-gray-900">{schemes.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
          <p className="text-xs font-bold text-green-600 uppercase mb-1">Active Schemes</p>
          <p className="text-2xl font-black text-gray-900">
            {schemes.filter(s => s.is_active).length}
          </p>
        </div>
      </div>

      {/* Schemes List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
          <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">
            {search ? 'No schemes found matching your search' : 'No schemes available'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(scheme => (
            <div
              key={scheme.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition hover:shadow-md"
            >
              {/* Collapsed Header */}
              <div
                onClick={() => toggleExpand(scheme.id)}
                className="p-5 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">
                        ACTIVE
                      </span>
                      {scheme.organization_name && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg">
                          {scheme.organization_name}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={12} />
                        Since {formatDate(scheme.start_date)}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{scheme.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{scheme.description}</p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition ml-4">
                    {expandedId === scheme.id ? (
                      <ChevronUp size={20} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === scheme.id && (
                <div className="px-5 pb-5 pt-0 border-t border-gray-100 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Eligibility */}
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <Users size={18} />
                        <span className="font-bold">Who Can Apply</span>
                      </div>
                      <p className="text-sm text-blue-800 whitespace-pre-line">
                        {scheme.eligibility}
                      </p>
                    </div>

                    {/* Benefits */}
                    <div className="bg-green-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-green-600 mb-2">
                        <Gift size={18} />
                        <span className="font-bold">Benefits</span>
                      </div>
                      <p className="text-sm text-green-800 whitespace-pre-line">
                        {scheme.benefits}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">Start Date:</span>{' '}
                      <span className="font-bold text-gray-700">{formatDate(scheme.start_date)}</span>
                    </div>
                    {scheme.end_date && (
                      <div>
                        <span className="text-gray-500">End Date:</span>{' '}
                        <span className="font-bold text-gray-700">{formatDate(scheme.end_date)}</span>
                      </div>
                    )}
                    {!scheme.end_date && (
                      <div className="text-green-600 font-medium">
                        Ongoing Scheme
                      </div>
                    )}
                  </div>

                  {/* GR PDF Download */}
                  {scheme.gr_pdf_path && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText size={20} className="text-purple-600" />
                          <div>
                            <p className="font-bold text-purple-900">Government Resolution</p>
                            <p className="text-xs text-purple-600">Official GR document</p>
                          </div>
                        </div>
                        <button
                          onClick={() => downloadPdf(scheme.gr_pdf_path!, scheme.title)}
                          className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition active:scale-95"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitizenSchemes;
