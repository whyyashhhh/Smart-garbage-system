import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Toast from '../components/Toast';

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [statistics, setStatistics] = useState({ total: 0, pending: 0, resolved: 0 });
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    console.log('Current role:', role);
    if (role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchReports();
  }, [navigate]);

  const fetchReports = async () => {
    try {
      console.log('Fetching reports...');
      const response = await api.get('/reports/admin/all');
      console.log('Reports response:', response.data);
      setReports(response.data.reports);
      setStatistics(response.data.statistics);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      showToast('Failed to fetch reports: ' + (error.response?.data?.message || error.message), 'error');
      setLoading(false);
    }
  };

  const handleResolve = async (reportId) => {
    try {
      await api.put(`/reports/admin/resolve/${reportId}`);
      showToast('✅ Report resolved! Email sent to user and admin copy sent to ocurse30@gmail.com', 'success');
      fetchReports(); // Refresh the list
    } catch (error) {
      showToast(error.response?.data?.message || error.response?.data?.error || 'Failed to resolve report', 'error');
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await api.delete(`/reports/admin/${reportId}`);
      showToast('Report deleted successfully!', 'success');
      fetchReports(); // Refresh the list
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to delete report', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/admin/login');
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.status === filter;
  });

  const getStatusColor = (status) => {
    return status === 'pending' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  const getGarbageTypeColor = (type) => {
    const colors = {
      'Plastic': 'bg-blue-100 text-blue-800',
      'Paper': 'bg-yellow-100 text-yellow-800',
      'Metal': 'bg-gray-100 text-gray-800',
      'Glass': 'bg-purple-100 text-purple-800',
      'Organic': 'bg-green-100 text-green-800',
      'Mixed': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toast 
        message={toast.message}
        type={toast.type}
        show={toast.show}
      />

      {/* Header */}
      <nav className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Reports</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.total}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-red-600">{statistics.pending}</p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{statistics.resolved}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Reports
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === 'pending' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === 'resolved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No reports found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredReports.map((report) => (
              <div key={report._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
                        {report.status.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getGarbageTypeColor(report.garbageType)}`}>
                        {report.garbageType}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.description}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Location:</span> {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}
                      </p>
                      <p>
                        <span className="font-medium">Reported:</span> {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">By:</span> {report.userId?.name || 'Unknown'}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span> {report.userId?.email || 'N/A'}
                      </p>
                    </div>

                    {report.image && (
                      <div className="mt-4">
                        <img 
                          src={`http://localhost:5000${report.image}`} 
                          alt="Report" 
                          className="w-48 h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 mt-4 lg:mt-0 lg:ml-4">
                    {report.status === 'pending' && (
                      <button
                        onClick={() => handleResolve(report._id)}
                        className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200 font-medium"
                      >
                        ✓ Resolve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(report._id)}
                      className="flex-1 lg:flex-none bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
