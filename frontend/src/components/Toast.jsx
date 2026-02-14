import React, { useEffect } from 'react';

export default function Toast({ message, type }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            // Timeout is handled by parent component
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? '✓' : '⚠️';

    return (
        <div className={`fixed top-6 right-6 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-bounce z-50`}>
            <span className="text-xl">{icon}</span>
            <p className="font-semibold">{message}</p>
        </div>
    );
}
