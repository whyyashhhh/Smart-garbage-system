import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import API, { UPLOADS_BASE_URL } from '../services/api';

export default function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [filter, setFilter] = useState('All'); // All, Pending, Resolved

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await API.get('/reports/user');
            setReports(response.data.reports);
        } catch (error) {
            showToast('Failed to load reports', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (reportId, newStatus) => {
        try {
            await API.put(`/reports/${reportId}`, { status: newStatus });
            setReports(reports.map(r =>
                r._id === reportId ? { ...r, status: newStatus } : r
            ));
            showToast('Report status updated!', 'success');
        } catch (error) {
            showToast('Failed to update report', 'error');
        }
    };

    const handleDelete = async (reportId) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            try {
                await API.delete(`/reports/${reportId}`);
                setReports(reports.filter(r => r._id !== reportId));
                showToast('Report deleted successfully', 'success');
            } catch (error) {
                showToast('Failed to delete report', 'error');
            }
        }
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Filter reports
    let filteredReports = reports;
    if (filter !== 'All') {
        filteredReports = reports.filter(r => r.status === filter);
    }

    // Get garbage type icon
    const getGarbageIcon = (type) => {
        const icons = {
            'Plastic': '♻️',
            'Wet Waste': '🌿',
            'Medical Waste': '⚠️',
            'Overflowing Bin': '🗑️',
            'Illegal Dumping': '⛔'
        };
        return icons[type] || '📍';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">My Reports</h1>

                {/* Filter buttons */}
                <div className="flex gap-4 mb-8">
                    {['All', 'Pending', 'Resolved'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-6 py-2 rounded-lg font-semibold transition ${
                                filter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-600 border-2 border-gray-200'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin">
                            <div className="text-4xl">⏳</div>
                        </div>
                        <p className="mt-4 text-gray-600">Loading reports...</p>
                    </div>
                )}

                {/* Reports grid */}
                {!loading && filteredReports.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredReports.map(report => (
                            <div
                                key={report._id}
                                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden"
                            >
                                {/* Image */}
                                {report.image && (
                                    <img
                                        src={`${UPLOADS_BASE_URL}/${report.image}`}
                                        alt="Report"
                                        className="w-full h-48 object-cover"
                                    />
                                )}

                                <div className="p-6">
                                    {/* Garbage type with icon */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-2xl">
                                            {getGarbageIcon(report.garbageType)}
                                        </span>
                                        <h3 className="text-lg font-bold text-gray-800">
                                            {report.garbageType}
                                        </h3>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {report.description}
                                    </p>

                                    {/* Location coordinates */}
                                    <div className="bg-gray-50 rounded p-3 mb-4 text-xs">
                                        <p className="text-gray-600">
                                            📍 {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                                        </p>
                                    </div>

                                    {/* Date */}
                                    <p className="text-gray-500 text-xs mb-4">
                                        📅 {new Date(report.createdAt).toLocaleDateString()}
                                    </p>

                                    {/* Status badge */}
                                    <div className="mb-4">
                                        <span className={`px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2 ${
                                            report.status === 'Resolved'
                                                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                                                : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                                        }`}>
                                            {report.status === 'Resolved' ? '✅' : '⏳'}
                                            {report.status}
                                        </span>
                                        {report.status === 'Pending' && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                You'll receive an email when this is resolved
                                            </p>
                                        )}
                                        {report.status === 'Resolved' && (
                                            <p className="text-xs text-green-600 mt-2">
                                                ✓ This issue has been resolved by our team
                                            </p>
                                        )}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDelete(report._id)}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm font-semibold transition"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && filteredReports.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-4xl mb-4">📭</p>
                        <p className="text-gray-600 text-lg">No {filter.toLowerCase()} reports yet</p>
                        <p className="text-gray-500 mt-2">Start reporting garbage issues in your area!</p>
                    </div>
                )}
            </div>

            {/* Toast Notification */}
            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}
