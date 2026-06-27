
import React, { useState, useEffect } from 'react';
import { schemesApi } from '../../api/schemes.api';
import { useAuth } from '../../auth/AuthContext';
import { 
  BookOpen, 
  Plus, 
  Loader2, 
  Calendar, 
  Users, 
  Gift,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Upload
} from 'lucide-react';

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

interface SchemeForm {
  title: string;
  description: string;
  eligibility: string;
  benefits: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  gr_pdf_file?: File | null;
}

const emptyForm: SchemeForm = {
  title: '',
  description: '',
  eligibility: '',
  benefits: '',
  start_date: '',
  end_date: '',
  is_active: true,
  gr_pdf_file: null,
};

const AdminSchemes: React.FC = () => {
  const { token } = useAuth();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [form, setForm] = useState<SchemeForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingPdfSchemeId, setUploadingPdfSchemeId] = useState<number | null>(null);

  useEffect(() => {
    console.debug('[AdminSchemes] useEffect - token:', token);
    loadSchemes();
  }, [token]);

  const debugTokenPreview = token ? `${token.substring(0,8)}...` : 'no-token';

  const DebugBanner = () => (
    <div style={{padding: '8px 12px', background: '#fff6', borderRadius: 8, marginBottom: 12}}>
      <strong>DEBUG:</strong> token={debugTokenPreview} schemes={schemes.length}
    </div>
  );

  const loadSchemes = async () => {
    try {
      setLoading(true);
      const res = await schemesApi.getAll();
      console.debug('[AdminSchemes] loadSchemes - fetched', Array.isArray(res.data) ? res.data.length : 'N/A');
      setSchemes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingScheme(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const openEditModal = (scheme: Scheme) => {
    setEditingScheme(scheme);
    setForm({
      title: scheme.title,
      description: scheme.description,
      eligibility: scheme.eligibility,
      benefits: scheme.benefits,
      start_date: scheme.start_date.split('T')[0],
      end_date: scheme.end_date ? scheme.end_date.split('T')[0] : '',
      is_active: scheme.is_active,
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingScheme(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
  };

      <DebugBanner />
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const files = (e.target as HTMLInputElement).files;
      setForm(prev => ({
        ...prev,
        gr_pdf_file: files?.[0] || null,
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title || !form.description || !form.eligibility || !form.benefits || !form.start_date) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: form.title,
        description: form.description,
        eligibility: form.eligibility,
        benefits: form.benefits,
        start_date: new Date(form.start_date).toISOString(),
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        is_active: form.is_active,
      };

      let schemeId: number;
      if (editingScheme) {
        await schemesApi.update(String(editingScheme.id), payload);
        schemeId = editingScheme.id;
        setSuccess('Scheme updated successfully!');
      } else {
        const res = await schemesApi.create(payload);
        schemeId = res.data.id;
        setSuccess('Scheme created successfully!');
      }

      // Upload PDF if provided
      if (form.gr_pdf_file && schemeId) {
        try {
          await schemesApi.uploadGRPdf(String(schemeId), form.gr_pdf_file);
          setSuccess('Scheme and PDF uploaded successfully!');
        } catch (pdfErr: any) {
          setSuccess('Scheme created but PDF upload failed. You can upload it later.');
          console.error('PDF upload error:', pdfErr);
        }
      }

      await loadSchemes();
      setTimeout(() => {
        closeModal();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save scheme');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this scheme?')) return;

    try {
      await schemesApi.delete(String(id));
      await loadSchemes();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete scheme');
    }
  };

  const handleGRPdfUpload = async (schemeId: number, file: File) => {
    if (!file.name.endsWith('.pdf')) {
      alert('Please upload a PDF file');
      return;
    }

    try {
      setUploadingPdfSchemeId(schemeId);
      await schemesApi.uploadGRPdf(String(schemeId), file);
      await loadSchemes();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to upload PDF');
    } finally {
      setUploadingPdfSchemeId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Government Schemes</h1>
          <p className="text-gray-500">{schemes.length} schemes registered</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition shadow-lg shadow-blue-100"
        >
          <Plus size={18} />
          Add Scheme
        </button>
      </div>

      {/* Schemes Grid */}
      {schemes.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center">
          <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-medium">No schemes created yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add Scheme" to create one</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {schemes.map(scheme => (
            <div
              key={scheme.id}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                      scheme.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {scheme.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    {scheme.organization_name && (
                      <span className="px-2 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-lg">
                        {scheme.organization_name}
                      </span>
                    )}
                    <span className="text-xs font-mono text-gray-400">#{scheme.id}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{scheme.title}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(scheme)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Edit2 size={16} className="text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(scheme.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">{scheme.description}</p>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Users size={14} />
                    <span className="text-xs font-bold uppercase">Eligibility</span>
                  </div>
                  <p className="text-xs text-blue-800 line-clamp-2">{scheme.eligibility}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <Gift size={14} />
                    <span className="text-xs font-bold uppercase">Benefits</span>
                  </div>
                  <p className="text-xs text-green-800 line-clamp-2">{scheme.benefits}</p>
                </div>
              </div>

              {/* GR PDF Section */}
              <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-purple-600">
                    <FileText size={14} />
                    <span className="text-xs font-bold uppercase">Government Resolution</span>
                  </div>
                  {uploadingPdfSchemeId === scheme.id && (
                    <Loader2 className="animate-spin text-purple-600" size={14} />
                  )}
                </div>
                {scheme.gr_pdf_path ? (
                  <p className="text-xs text-purple-700 font-medium">✓ PDF Uploaded</p>
                ) : (
                  <p className="text-xs text-purple-600">No PDF uploaded</p>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleGRPdfUpload(scheme.id, file);
                  }}
                  disabled={uploadingPdfSchemeId === scheme.id}
                  className="mt-2 text-xs cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                />
              </div>

              {/* Dates */}
              <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  Start: {formatDate(scheme.start_date)}
                </div>
                {scheme.end_date && (
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    End: {formatDate(scheme.end_date)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl my-8 animate-scaleUp">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingScheme ? 'Edit Scheme' : 'Create New Scheme'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center text-green-700">
                  <CheckCircle size={18} className="mr-2" />
                  {success}
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700">
                  <AlertCircle size={18} className="mr-2" />
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Scheme Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., PM Awas Yojana"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe the scheme and its purpose..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                />
              </div>

              {/* Eligibility */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Eligibility Criteria *
                </label>
                <textarea
                  name="eligibility"
                  value={form.eligibility}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Who can apply for this scheme..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                />
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Benefits *
                </label>
                <textarea
                  name="benefits"
                  value={form.benefits}
                  onChange={handleChange}
                  rows={2}
                  placeholder="What benefits will the applicant receive..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Scheme is active and visible to citizens
                </label>
              </div>

              {/* GR PDF Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Government Resolution PDF (Optional)
                </label>
                <div className="p-4 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50 cursor-pointer hover:bg-purple-100 transition">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleChange}
                    className="w-full cursor-pointer text-sm"
                  />
                  <p className="text-xs text-purple-600 mt-2">
                    {form.gr_pdf_file ? (
                      <>✓ {form.gr_pdf_file.name} selected</>
                    ) : (
                      <>Click to select PDF file for Government Resolution</>
                    )}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : editingScheme ? (
                    'Update Scheme'
                  ) : (
                    'Create Scheme'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchemes;
