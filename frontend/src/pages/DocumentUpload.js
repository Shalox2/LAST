import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const DocumentUpload = () => {
    const { shopId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        business_license_number: '',
        tax_id: '',
        business_address: '',
        business_phone: '',
        business_email: '',
        business_license_document: null,
        tax_certificate: null,
        identity_document: null
    });

    const fetchShop = useCallback(async () => {
        try {
            const response = await axios.get(`/api/shops/${shopId}/`);
            setShop(response.data);
            setFormData({
                business_license_number: response.data.business_license_number || '',
                tax_id: response.data.tax_id || '',
                business_address: response.data.business_address || '',
                business_phone: response.data.business_phone || '',
                business_email: response.data.business_email || '',
                business_license_document: null,
                tax_certificate: null,
                identity_document: null
            });
        } catch (error) {
            console.error('Error fetching shop:', error);
        } finally {
            setLoading(false);
        }
    }, [shopId]);

    useEffect(() => {
        fetchShop();
    }, [fetchShop]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        const uploadData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) {
                uploadData.append(key, formData[key]);
            }
        });

        try {
            await axios.post(`/api/shops/${shopId}/documents/`, uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Documents uploaded successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error uploading documents:', error);
            alert('Error uploading documents. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    if (!shop || shop.owner !== user.id) {
        return <div className="error">Access denied</div>;
    }

    return (
        <div className="document-upload">
            <div className="container">
                <h1>Upload Verification Documents</h1>
                <div className="shop-info">
                    <h2>{shop.name}</h2>
                    <p>Status: <span className={`status status-${shop.verification_status}`}>
                        {shop.verification_status.replace('_', ' ').toUpperCase()}
                    </span></p>
                </div>

                <form onSubmit={handleSubmit} className="upload-form">
                    <div className="form-section">
                        <h3>Business Information</h3>
                        
                        <div className="form-group">
                            <label htmlFor="business_license_number">Business License Number *</label>
                            <input
                                type="text"
                                id="business_license_number"
                                name="business_license_number"
                                value={formData.business_license_number}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="tax_id">Tax ID *</label>
                            <input
                                type="text"
                                id="tax_id"
                                name="tax_id"
                                value={formData.tax_id}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="business_address">Business Address</label>
                            <textarea
                                id="business_address"
                                name="business_address"
                                value={formData.business_address}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="business_phone">Business Phone</label>
                            <input
                                type="tel"
                                id="business_phone"
                                name="business_phone"
                                value={formData.business_phone}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="business_email">Business Email</label>
                            <input
                                type="email"
                                id="business_email"
                                name="business_email"
                                value={formData.business_email}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Required Documents</h3>
                        
                        <div className="form-group">
                            <label htmlFor="business_license_document">Business License Document *</label>
                            <input
                                type="file"
                                id="business_license_document"
                                name="business_license_document"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                                required={!shop.business_license_document}
                            />
                            {shop.business_license_document && (
                                <p className="file-status">✓ Already uploaded</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="tax_certificate">Tax Certificate *</label>
                            <input
                                type="file"
                                id="tax_certificate"
                                name="tax_certificate"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                                required={!shop.tax_certificate}
                            />
                            {shop.tax_certificate && (
                                <p className="file-status">✓ Already uploaded</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="identity_document">Identity Document *</label>
                            <input
                                type="file"
                                id="identity_document"
                                name="identity_document"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                                required={!shop.identity_document}
                            />
                            {shop.identity_document && (
                                <p className="file-status">✓ Already uploaded</p>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            disabled={uploading}
                            className="btn btn-primary"
                        >
                            {uploading ? 'Uploading...' : 'Upload Documents'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => navigate('/dashboard')}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DocumentUpload;
