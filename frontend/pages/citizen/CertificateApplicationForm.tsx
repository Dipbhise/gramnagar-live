import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { certificatesApi } from '../../api/certificates.api';
import { CertificateType } from '../../types';
import { AlertCircle, FileText, Calendar, User, CheckCircle, ArrowLeft, Paperclip, Trash2 } from 'lucide-react';

const CertificateApplicationForm: React.FC = () => {
  const { typeId } = useParams<{ typeId: string }>();
  const navigate = useNavigate();
  const [certificateType, setCertificateType] = useState<CertificateType | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentPreviews, setDocumentPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (typeId) {
      fetchCertificateType();
    }
  }, [typeId]);

  const fetchCertificateType = async () => {
    try {
      const response = await certificatesApi.getCertificateTypes();
      const types = response.data;
      const type = types.find((t: CertificateType) => t.id.toString() === typeId);
      setCertificateType(type);
      console.log('Found certificate type:', type);
    } catch (error) {
      console.error('Error fetching certificate type:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (fieldKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setDocuments(prev => [...prev, ...newFiles]);
      
      // Create previews for new files
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === 'string') {
            setDocumentPreviews(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
    setDocumentPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!certificateType) return false;

    const newErrors: Record<string, string> = {};

    try {
      const requiredFieldsConfig = JSON.parse(certificateType.required_fields);
      Object.entries(requiredFieldsConfig).forEach(([fieldKey, fieldConfig]: [string, any]) => {
        if (fieldConfig.required && !formData[fieldKey]?.toString().trim()) {
          newErrors[fieldKey] = `${fieldConfig.label || fieldKey} is required`;
        }
      });
    } catch (e) {
      console.error('Error parsing required fields:', e);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Use the API service to handle authentication and errors
      await certificatesApi.applyForCertificateWithDocs(
        certificateType!.id,
        JSON.stringify(formData),
        documents
      );
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/citizen/certificates');
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting application:', error);
      alert(error.message || 'Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  console.log('Rendering state - loading:', loading, 'certificateType:', certificateType, 'success:', success);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="ml-4">Loading certificate form...</p>
      </div>
    );
  }

  if (!certificateType) {
    console.log('No certificate type found, showing error message');
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-3" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Certificate type not found</h3>
        <p className="text-gray-500">The requested certificate type does not exist.</p>
        <p className="text-sm text-gray-500 mt-2">Type ID: {typeId}</p>
        <button
          onClick={() => navigate('/citizen/certificates')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Back to Certificates
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Application Submitted Successfully!</h3>
        <p className="text-gray-500 mb-4">Your application has been submitted for review.</p>
        <p className="text-sm text-gray-500">Redirecting...</p>
      </div>
    );
  }

  try {
    const requiredFieldsConfig = JSON.parse(certificateType.required_fields);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center">
          <button
            onClick={() => navigate('/citizen/certificates')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Certificates
          </button>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">Apply for {certificateType.display_name}</h1>
            <p className="text-gray-600">Fill out the form to submit your certificate application</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="mr-2 text-blue-600" size={20} />
              Application Details
            </h2>
            
            <div className="space-y-4">
              {Object.entries(requiredFieldsConfig).map(([fieldKey, fieldConfig]: [string, any]) => (
                <div key={fieldKey} className="space-y-1">
                  <label htmlFor={fieldKey} className="block text-sm font-medium text-gray-700">
                    {fieldConfig.label || fieldKey} {fieldConfig.required && '*'}
                  </label>
                  
                  {fieldConfig.type === 'textarea' ? (
                    <textarea
                      id={fieldKey}
                      value={formData[fieldKey] || ''}
                      onChange={(e) => handleChange(fieldKey, e.target.value)}
                      required={fieldConfig.required}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[fieldKey] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  ) : fieldConfig.type === 'select' ? (
                    <select
                      id={fieldKey}
                      value={formData[fieldKey] || ''}
                      onChange={(e) => handleChange(fieldKey, e.target.value)}
                      required={fieldConfig.required}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[fieldKey] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select {fieldConfig.label || fieldKey}</option>
                      {fieldConfig.options?.map((option: string) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : fieldConfig.type === 'date' ? (
                    <input
                      type="date"
                      id={fieldKey}
                      value={formData[fieldKey] || ''}
                      onChange={(e) => handleChange(fieldKey, e.target.value)}
                      required={fieldConfig.required}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[fieldKey] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  ) : (
                    <input
                      type={fieldConfig.type || 'text'}
                      id={fieldKey}
                      value={formData[fieldKey] || ''}
                      onChange={(e) => handleChange(fieldKey, e.target.value)}
                      required={fieldConfig.required}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[fieldKey] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  )}
                  
                  {errors[fieldKey] && (
                    <p className="text-red-500 text-sm">{errors[fieldKey]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Supporting Documents */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Paperclip className="mr-2 text-blue-600" size={20} />
              Supporting Documents
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload supporting documents (optional)
                </label>
                <div className="flex items-center">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Paperclip className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, JPG, PNG (Max 5MB each)
                      </p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleDocumentChange}
                    />
                  </label>
                </div>
              </div>

              {/* Document Previews */}
              {documentPreviews.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Documents</h3>
                  <div className="space-y-2">
                    {documentPreviews.map((preview, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="text-gray-400 mr-2" size={16} />
                          <span className="text-sm text-gray-800">{documents[index]?.name || `Document ${index + 1}`}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/citizen/certificates')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    );
  } catch (e) {
    console.error('Error rendering form:', e);
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-3" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Error Loading Form</h3>
        <p className="text-gray-500">There was an error loading the certificate application form.</p>
        <button
          onClick={() => navigate('/citizen/certificates')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Back to Certificates
        </button>
      </div>
    );
  }
};

export default CertificateApplicationForm;