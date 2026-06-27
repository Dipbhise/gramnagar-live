import React, { useState, useEffect } from 'react';
import { taxApi } from '../../api/tax.api';
import {
  Loader2,
  DollarSign,
  Users,
  Plus,
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

interface TaxType {
  id: number;
  name: string;
  description?: string;
}

interface Citizen {
  id: number;
  name: string;
  email: string;
  village: string;
  area: string;
}

interface Tax {
  id: number;
  citizen_id: number;
  citizen_name?: string;
  tax_type_id: number;
  tax_type_name: string;
  amount_owed: number;
  is_paid: boolean;
  paid_date?: string;
  created_at: string;
}

const AdminTaxManagement: React.FC = () => {
  const { organizationName, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'citizens' | 'types'>('citizens');
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [taxTypes, setTaxTypes] = useState<TaxType[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCitizen, setExpandedCitizen] = useState<number | null>(null);
  const [citizenTaxes, setCitizenTaxes] = useState<Record<number, Tax[]>>({});
  const [newTaxType, setNewTaxType] = useState('');
  const [newTaxDesc, setNewTaxDesc] = useState('');
  const [selectedCitizen, setSelectedCitizen] = useState<number | null>(null);
  const [selectedTaxType, setSelectedTaxType] = useState<number | null>(null);
  const [taxAmount, setTaxAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [citizensRes, typesRes] = await Promise.all([
        taxApi.getCitizensInOrg(),
        taxApi.getTaxTypes(),
      ]);
      setCitizens(citizensRes.data);
      setTaxTypes(typesRes.data);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCitizenTaxes = async (citizenId: number) => {
    try {
      const res = await taxApi.getCitizenTaxes(citizenId);
      setCitizenTaxes((prev) => ({
        ...prev,
        [citizenId]: res.data,
      }));
    } catch (err) {
      console.error('Failed to load taxes:', err);
    }
  };

  const handleCreateTaxType = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await taxApi.createTaxType({
        name: newTaxType,
        description: newTaxDesc,
      });
      setTaxTypes([...taxTypes, res.data]);
      setNewTaxType('');
      setNewTaxDesc('');
      setSuccess('Tax type created successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create tax type');
    }
  };

  const handleAssignTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedCitizen || !selectedTaxType || !taxAmount) {
      setError('Please fill all fields');
      return;
    }

    try {
      const res = await taxApi.assignTaxToCitizen(selectedCitizen, {
        citizen_id: selectedCitizen,
        tax_type_id: selectedTaxType,
        amount_owed: parseFloat(taxAmount),
      });
      setSuccess('Tax assigned successfully');
      setSelectedCitizen(null);
      setSelectedTaxType(null);
      setTaxAmount('');
      
      // Reload taxes for this citizen
      await loadCitizenTaxes(selectedCitizen);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to assign tax');
    }
  };

  const toggleCitizenExpand = (citizenId: number) => {
    if (expandedCitizen === citizenId) {
      setExpandedCitizen(null);
    } else {
      setExpandedCitizen(citizenId);
      loadCitizenTaxes(citizenId);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign size={28} />
          <div>
            <h1 className="text-2xl font-bold">Tax Management</h1>
            <p className="text-xs text-blue-200">{organizationName}</p>
          </div>
        </div>
        <p className="text-blue-100">
          Manage citizen taxes and payment statuses
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('citizens')}
          className={`px-6 py-3 font-bold border-b-2 transition ${
            activeTab === 'citizens'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Citizens & Taxes
        </button>
        <button
          onClick={() => setActiveTab('types')}
          className={`px-6 py-3 font-bold border-b-2 transition ${
            activeTab === 'types'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Tax Types
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-xl flex items-start gap-3">
          <Check size={20} className="flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Citizens Tab */}
      {activeTab === 'citizens' && (
        <div className="space-y-4">
          {/* Assign Tax Form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-blue-600" />
              Assign Tax to Citizen
            </h3>

            <form onSubmit={handleAssignTax} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Citizen Select */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Citizen
                  </label>
                  <select
                    value={selectedCitizen || ''}
                    onChange={(e) => setSelectedCitizen(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select a citizen...</option>
                    {citizens.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tax Type Select */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tax Type
                  </label>
                  <select
                    value={selectedTaxType || ''}
                    onChange={(e) => setSelectedTaxType(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select tax type...</option>
                    {taxTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Assign Tax
              </button>
            </form>
          </div>

          {/* Citizens List */}
          <div className="space-y-3">
            {citizens.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <Users size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No citizens registered yet</p>
              </div>
            ) : (
              citizens.map((citizen) => (
                <div
                  key={citizen.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Citizen Header */}
                  <div
                    onClick={() => toggleCitizenExpand(citizen.id)}
                    className="p-5 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{citizen.name}</h3>
                        <p className="text-sm text-gray-600">{citizen.email}</p>
                        <p className="text-xs text-gray-500">
                          {citizen.village}, {citizen.area}
                        </p>
                      </div>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                        {expandedCitizen === citizen.id ? (
                          <ChevronUp size={20} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Citizen Taxes */}
                  {expandedCitizen === citizen.id && (
                    <div className="px-5 pb-5 pt-0 border-t border-gray-100 space-y-3">
                      {citizenTaxes[citizen.id]?.length === 0 ? (
                        <p className="text-gray-500 text-sm py-4 text-center">
                          No taxes assigned
                        </p>
                      ) : (
                        citizenTaxes[citizen.id]?.map((tax) => (
                          <div
                            key={tax.id}
                            className="p-4 bg-gray-50 rounded-xl flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <p className="font-bold text-gray-900">
                                {tax.tax_type_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(tax.amount_owed)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Created: {formatDate(tax.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {tax.is_paid ? (
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg">
                                  <Check size={16} />
                                  <span className="text-xs font-bold">Paid</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg">
                                  <Clock size={16} />
                                  <span className="text-xs font-bold">Pending</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tax Types Tab */}
      {activeTab === 'types' && (
        <div className="space-y-4">
          {/* Create Tax Type Form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-blue-600" />
              Create New Tax Type
            </h3>

            <form onSubmit={handleCreateTaxType} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tax Type Name
                  </label>
                  <input
                    type="text"
                    value={newTaxType}
                    onChange={(e) => setNewTaxType(e.target.value)}
                    placeholder="e.g., Water, Electricity"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={newTaxDesc}
                    onChange={(e) => setNewTaxDesc(e.target.value)}
                    placeholder="Brief description"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Create Tax Type
              </button>
            </form>
          </div>

          {/* Tax Types List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {taxTypes.map((type) => (
              <div
                key={type.id}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
              >
                <h3 className="font-bold text-lg text-gray-900 mb-2">{type.name}</h3>
                <p className="text-sm text-gray-600">{type.description || 'No description'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTaxManagement;
