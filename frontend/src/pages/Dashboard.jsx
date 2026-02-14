import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MapComponent from '../components/MapComponent';
import ReportModal from '../components/ReportModal';
import Toast from '../components/Toast';

export default function Dashboard() {
    const [showMap, setShowMap] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [toast, setToast] = useState(null);
    const [reports, setReports] = useState([]);

    const handleCheckLocality = () => {
        // Request GPS permission
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ latitude, longitude });
                    setShowMap(true);
                    showToast('Location detected!', 'success');
                },
                (error) => {
                    showToast('Unable to get location. Please enable GPS.', 'error');
                }
            );
        } else {
            showToast('Geolocation not supported in your browser', 'error');
        }
    };

    const handleReportSubmit = (newReport) => {
        setReports([...reports, newReport]);
        setShowModal(false);
        showToast('Report submitted successfully!', 'success');
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Welcome to Smart Garbage Reporting
                    </h1>
                    <p className="text-gray-600 text-lg mb-8">
                        Help keep your locality clean by reporting garbage issues
                    </p>

                    <button
                        onClick={handleCheckLocality}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105 shadow-lg"
                    >
                        📍 Check Your Locality
                    </button>
                </div>

                {/* Map section */}
                {showMap && userLocation && (
                    <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
                        <MapComponent
                            userLocation={userLocation}
                            reports={reports}
                            onReportClick={() => setShowModal(true)}
                        />
                        <button
                            onClick={() => setShowModal(true)}
                            className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg text-2xl transition transform hover:scale-110"
                            title="Report Garbage"
                        >
                            📍
                        </button>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <h3 className="text-gray-600 text-sm mb-2">Your Reports</h3>
                        <p className="text-3xl font-bold text-blue-600">{reports.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <h3 className="text-gray-600 text-sm mb-2">Status</h3>
                        <p className="text-lg text-green-600 font-semibold">Active Contributor</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <h3 className="text-gray-600 text-sm mb-2">Impact</h3>
                        <p className="text-lg text-purple-600 font-semibold">Making a Difference</p>
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            {showModal && userLocation && (
                <ReportModal
                    userLocation={userLocation}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleReportSubmit}
                    onShowToast={showToast}
                />
            )}

            {/* Toast Notification */}
            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}
