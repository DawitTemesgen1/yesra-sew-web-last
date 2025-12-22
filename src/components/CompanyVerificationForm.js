import React, { useState, useEffect } from 'react';
import { supabase } from '../services/api';
import toast from 'react-hot-toast';

const CompanyVerificationForm = ({ userId, onVerificationSubmitted }) => {
    const [formData, setFormData] = useState({
        company_name: '',
        tin_number: '',
        business_license: null,
        registration_certificate: null
    });
    const [existingRequest, setExistingRequest] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        checkExistingRequest();
    }, [userId]);

    const checkExistingRequest = async () => {
        try {
            const { data, error } = await supabase
                .from('company_verification_requests')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (data) {
                setExistingRequest(data);
            }
        } catch (error) {
            // No existing request
        }
    };

    const handleFileUpload = async (file, fieldName) => {
        if (!file) return null;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/${fieldName}_${Date.now()}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('verification-documents')
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('verification-documents')
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload document');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Upload documents
            let businessLicenseUrl = null;
            let registrationCertUrl = null;

            if (formData.business_license) {
                businessLicenseUrl = await handleFileUpload(formData.business_license, 'business_license');
            }

            if (formData.registration_certificate) {
                registrationCertUrl = await handleFileUpload(formData.registration_certificate, 'registration_cert');
            }

            // Submit verification request
            const { error } = await supabase
                .from('company_verification_requests')
                .insert({
                    user_id: userId,
                    company_name: formData.company_name,
                    tin_number: formData.tin_number,
                    business_license: businessLicenseUrl,
                    registration_certificate: registrationCertUrl,
                    status: 'pending'
                });

            if (error) throw error;

            toast.success('Verification request submitted successfully!');

            if (onVerificationSubmitted) {
                onVerificationSubmitted();
            }

            checkExistingRequest();
        } catch (error) {
            console.error('Submission error:', error);
            toast.error('Failed to submit verification request');
        } finally {
            setLoading(false);
        }
    };

    if (existingRequest) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Company Verification Status
                </h3>

                <div className={`p-4 rounded-lg mb-4 ${existingRequest.status === 'approved' ? 'bg-green-50 border-2 border-green-200' :
                        existingRequest.status === 'rejected' ? 'bg-red-50 border-2 border-red-200' :
                            existingRequest.status === 'needs_info' ? 'bg-yellow-50 border-2 border-yellow-200' :
                                'bg-blue-50 border-2 border-blue-200'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${existingRequest.status === 'approved' ? 'bg-green-500 text-white' :
                                existingRequest.status === 'rejected' ? 'bg-red-500 text-white' :
                                    existingRequest.status === 'needs_info' ? 'bg-yellow-500 text-white' :
                                        'bg-blue-500 text-white'
                            }`}>
                            {existingRequest.status.toUpperCase().replace('_', ' ')}
                        </span>
                    </div>

                    {existingRequest.status === 'approved' && (
                        <div className="mt-4">
                            <p className="text-green-700 font-semibold flex items-center">
                                <span className="text-2xl mr-2">✓</span>
                                Your company is verified! You can now post jobs and tenders.
                            </p>
                        </div>
                    )}

                    {existingRequest.status === 'pending' && (
                        <div className="mt-4">
                            <p className="text-blue-700">
                                Your verification request is being reviewed. We'll notify you once it's processed.
                            </p>
                        </div>
                    )}

                    {existingRequest.status === 'rejected' && (
                        <div className="mt-4">
                            <p className="text-red-700 font-semibold mb-2">
                                Your verification request was rejected.
                            </p>
                            {existingRequest.admin_notes && (
                                <p className="text-gray-700 bg-white p-3 rounded">
                                    <strong>Reason:</strong> {existingRequest.admin_notes}
                                </p>
                            )}
                            <button
                                onClick={() => setExistingRequest(null)}
                                className="mt-4 text-blue-600 font-semibold hover:underline"
                            >
                                Submit New Request →
                            </button>
                        </div>
                    )}

                    {existingRequest.status === 'needs_info' && (
                        <div className="mt-4">
                            <p className="text-yellow-700 font-semibold mb-2">
                                Additional information required
                            </p>
                            {existingRequest.admin_notes && (
                                <p className="text-gray-700 bg-white p-3 rounded">
                                    {existingRequest.admin_notes}
                                </p>
                            )}
                            <button
                                onClick={() => setExistingRequest(null)}
                                className="mt-4 text-blue-600 font-semibold hover:underline"
                            >
                                Update Request →
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Company Name:</span>
                        <span className="font-semibold">{existingRequest.company_name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">TIN Number:</span>
                        <span className="font-semibold">{existingRequest.tin_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Submitted:</span>
                        <span className="font-semibold">
                            {new Date(existingRequest.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Company Verification Required
                </h3>
                <p className="text-gray-600">
                    To post jobs and tenders, your company must be verified. Please provide the following information:
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your registered company name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        TIN Number (Tax Identification Number)
                    </label>
                    <input
                        type="text"
                        value={formData.tin_number}
                        onChange={(e) => setFormData({ ...formData, tin_number: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your TIN number"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Business License <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="file"
                        required
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setFormData({ ...formData, business_license: e.target.files[0] })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Upload your business license (PDF, JPG, or PNG)
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Registration Certificate
                    </label>
                    <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setFormData({ ...formData, registration_certificate: e.target.files[0] })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Upload your company registration certificate (optional)
                    </p>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                    <p className="text-sm text-blue-700">
                        <strong>Note:</strong> Verification typically takes 1-3 business days. You'll be notified via email once your request is processed.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading || uploading}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading || uploading ? 'Submitting...' : 'Submit Verification Request'}
                </button>
            </form>
        </div>
    );
};

export default CompanyVerificationForm;

