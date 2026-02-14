import React, { useState } from 'react';
import API from '../services/api';

export default function ReportModal({ userLocation, onClose, onSubmit, onShowToast }) {
    const [garbageType, setGarbageType] = useState('Plastic');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const garbageTypes = ['Plastic', 'Wet Waste', 'Medical Waste', 'Overflowing Bin', 'Illegal Dumping'];

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!description.trim()) {
            onShowToast('Please provide a description', 'error');
            return;
        }

        setLoading(true);

        try {
            // Create FormData for image upload
            const formData = new FormData();
            formData.append('garbageType', garbageType);
            formData.append('description', description);
            formData.append('latitude', userLocation.latitude);
            formData.append('longitude', userLocation.longitude);
            if (image) {
                formData.append('image', image);
            }

            const response = await API.post('/reports', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            onSubmit(response.data.report);
            onShowToast('Report submitted successfully!', 'success');
            onClose();
        } catch (error) {
            onShowToast(error.response?.data?.message || 'Failed to submit report', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-screen overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Report Garbage</h2>
                    <button
                        onClick={onClose}
                        className="text-2xl hover:opacity-75"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Garbage Type */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">
                            Garbage Type
                        </label>
                        <select
                            value={garbageType}
                            onChange={(e) => setGarbageType(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        >
                            {garbageTypes.map(type => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the garbage issue..."
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none h-24"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">
                            Upload Photo (Optional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none"
                        />
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="mt-4 w-full h-32 object-cover rounded-lg"
                            />
                        )}
                    </div>

                    {/* Location Info */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">
                            📍 <strong>Location:</strong> {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg transition"
                    >
                        {loading ? '📤 Submitting...' : '📤 Submit Report'}
                    </button>
                </form>
            </div>
        </div>
    );
}
