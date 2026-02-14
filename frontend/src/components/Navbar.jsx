import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🗑️</span>
                    <h1 className="text-2xl font-bold">Smart Garbage System</h1>
                </div>

                {/* Navigation Links */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="hover:bg-white/20 px-4 py-2 rounded-lg transition"
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/reports')}
                        className="hover:bg-white/20 px-4 py-2 rounded-lg transition"
                    >
                        My Reports
                    </button>

                    {/* User info and logout */}
                    <div className="flex items-center gap-4 border-l border-white/30 pl-6">
                        <div className="text-sm">
                            <p className="text-white/70">Logged in as</p>
                            <p className="font-bold">{user.name || 'User'}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
