import React, { useState, useEffect } from 'react';
import { taxApi } from '../../api/tax.api';
import {
  Loader2,
  DollarSign,
  Check,
  Clock,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

interface Tax {
  id: number;
  citizen_id: number;
  tax_type_id: number;
  tax_type_name: string;
  amount_owed: number;
  is_paid: boolean;
  paid_date?: string;
  created_at: string;
  updated_at: string;
}

const CitizenMyTaxes: React.FC = () => {
  const { organizationName } = useAuth();
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paying, setPaying] = useState<number | null>(null);

  useEffect(() => {
    loadMyTaxes();
  }, []);

  const loadMyTaxes = async () => {
    setLoading(true);
    try {
      const res = await taxApi.getMyTaxes();
      setTaxes(res.data);
    } catch (err) {
      setError('Failed to load your taxes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (taxId: number) => {
    setPaying(taxId);
    setError('');
    setSuccess('');

    try {
      const res = await taxApi.markTaxAsPaid(taxId);
      setSuccess(res.data.message);
      
      // Update local state
      setTaxes((prev) =>
        prev.map((tax) =>
          tax.id === taxId
            ? { ...tax, is_paid: true, paid_date: new Date().toISOString() }
            : tax
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to mark tax as paid');
    } finally {
      setPaying(null);
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

  const totalTaxes = taxes.reduce((sum, tax) => sum + tax.amount_owed, 0);
  const paidTaxes = taxes.filter((tax) => tax.is_paid).length;
  const pendingTaxes = taxes.filter((tax) => !tax.is_paid).length;
  const totalPaid = taxes
    .filter((tax) => tax.is_paid)
    .reduce((sum, tax) => sum + tax.amount_owed, 0);
  const totalPending = taxes
    .filter((tax) => !tax.is_paid)
    .reduce((sum, tax) => sum + tax.amount_owed, 0);

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
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 rounded-3xl text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard size={28} />
          <div>
            <h1 className="text-2xl font-bold">My Taxes</h1>
            <p className="text-xs text-purple-200">{organizationName}</p>
          </div>
        </div>
        <p className="text-purple-100">
          View and manage your tax payments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Taxes</p>
          <p className="text-2xl font-black text-gray-900">{taxes.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
          <p className="text-xs font-bold text-green-600 uppercase mb-1">Paid</p>
          <p className="text-2xl font-black text-green-900">{paidTaxes}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
          <p className="text-xs font-bold text-yellow-600 uppercase mb-1">Pending</p>
          <p className="text-2xl font-black text-yellow-900">{pendingTaxes}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <p className="text-xs font-bold text-blue-600 uppercase mb-1">Amount Due</p>
          <p className="text-lg font-black text-blue-900">{formatCurrency(totalPending)}</p>
        </div>
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

      {/* Taxes List */}
      {taxes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
          <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">
            No taxes assigned yet. Great!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {taxes.map((tax) => (
            <div
              key={tax.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {tax.tax_type_name}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        Amount: <span className="font-bold">{formatCurrency(tax.amount_owed)}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Created: {formatDate(tax.created_at)}
                      </p>
                      {tax.paid_date && (
                        <p className="text-xs text-green-600">
                          Paid on: {formatDate(tax.paid_date)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {tax.is_paid ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold">
                        <Check size={18} />
                        Paid
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-bold">
                          <Clock size={18} />
                          Pending
                        </div>
                        <button
                          onClick={() => handleMarkAsPaid(tax.id)}
                          disabled={paying === tax.id}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-70 transition flex items-center gap-2 justify-center"
                        >
                          {paying === tax.id ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard size={16} />
                              Mark Paid
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {taxes.length > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Amount</p>
              <p className="text-2xl font-black text-gray-900">{formatCurrency(totalTaxes)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-green-600 uppercase mb-1">Total Paid</p>
              <p className="text-2xl font-black text-green-900">{formatCurrency(totalPaid)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-yellow-600 uppercase mb-1">Total Pending</p>
              <p className="text-2xl font-black text-yellow-900">{formatCurrency(totalPending)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenMyTaxes;
