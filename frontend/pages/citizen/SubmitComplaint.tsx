import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsApi } from '../../api/complaints.api';
import { useGeoLocation } from '../../hooks/useGeoLocation';
import { useAuth } from '../../auth/AuthContext';
import {
  Camera,
  MapPin,
  Upload,
  Loader2,
  RefreshCcw,
  Send,
  AlertCircle,
} from 'lucide-react';

const SubmitComplaint: React.FC = () => {
  const [address, setAddress] = useState('');
  const [village, setVillage] = useState('');
  const [area, setArea] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { latitude, longitude, loading, error, refresh } = useGeoLocation();
  const { organizationName } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (latitude === null || longitude === null) {
      alert('GPS location required');
      return;
    }

    if (!photo) {
      alert('Photo is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await complaintsApi.submit({
        address,
        village,
        area,
        latitude,
        longitude,
        photo,
      });

      navigate('/citizen/complaints', { state: { success: true } });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Submit Complaint</h1>
        <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
          {organizationName}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          required
          placeholder="Address / Landmark"
          className="w-full p-3 border rounded-xl"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <input
          placeholder="Village (optional)"
          className="w-full p-3 border rounded-xl"
          value={village}
          onChange={(e) => setVillage(e.target.value)}
        />

        <input
          placeholder="Area (optional)"
          className="w-full p-3 border rounded-xl"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />

        {/* GPS */}
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border">
          {loading ? (
            <div className="flex items-center text-sm text-gray-500">
              <Loader2 className="animate-spin mr-2" size={16} />
              Detecting GPS...
            </div>
          ) : error ? (
            <div className="flex items-center text-sm text-red-600">
              <AlertCircle size={16} className="mr-1" />
              {error}
            </div>
          ) : (
            <span className="text-sm font-semibold">
              {latitude?.toFixed(5)}, {longitude?.toFixed(5)}
            </span>
          )}
          <button type="button" onClick={refresh}>
            <RefreshCcw size={16} />
          </button>
        </div>

        {/* Photo */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-dashed border-2 p-6 rounded-xl text-center cursor-pointer"
        >
          {preview ? (
            <img src={preview} className="rounded-xl max-h-48 mx-auto" />
          ) : (
            <>
              <Upload className="mx-auto mb-2" />
              <p>Upload photo</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
        </button>
      </form>
    </div>
  );
};

export default SubmitComplaint;
