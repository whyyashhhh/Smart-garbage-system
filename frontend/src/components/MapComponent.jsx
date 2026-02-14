import React, { useEffect, useRef, useState } from 'react';

export default function MapComponent({ userLocation, reports, onReportClick }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [apiLoaded, setApiLoaded] = useState(!!window.google?.maps);

    useEffect(() => {
        // Wait a bit for Google Maps API to load
        const timer = setTimeout(() => {
            if (window.google?.maps) {
                setApiLoaded(true);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Only initialize map if API is loaded and container exists
        if (!apiLoaded || !window.google?.maps || !mapContainer.current) {
            return;
        }

        // Prevent multiple map initializations
        if (map.current) {
            return;
        }

        try {
            // Create map instance
            map.current = new window.google.maps.Map(mapContainer.current, {
                center: { lat: userLocation.latitude, lng: userLocation.longitude },
                zoom: 15,
                mapTypeControl: true,
                fullscreenControl: true,
                streetViewControl: false,
                styles: [
                    {
                        "featureType": "water",
                        "elementType": "geometry.fill",
                        "stylers": [{ "color": "#c1d9e8" }]
                    }
                ]
            });

            setMapLoaded(true);

            // Add user location marker (blue dot)
            new window.google.maps.Marker({
                map: map.current,
                position: { lat: userLocation.latitude, lng: userLocation.longitude },
                title: 'Your Current Location',
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#3b82f6',
                    fillOpacity: 1,
                    strokeColor: '#1e40af',
                    strokeWeight: 2
                },
                zIndex: 1000
            });

            // Add report markers
            reports.forEach((report) => {
                const garbageTypeEmoji = {
                    'Plastic': '♻️',
                    'Wet Waste': '🌿',
                    'Medical Waste': '⚠️',
                    'Overflowing Bin': '🗑️',
                    'Illegal Dumping': '⛔'
                };

                const infoWindow = new window.google.maps.InfoWindow({
                    content: `
                        <div style="padding: 10px; font-family: Arial;">
                            <p style="margin: 0; font-weight: bold; color: #1f2937;">${garbageTypeEmoji[report.garbageType]} ${report.garbageType}</p>
                            <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">${report.description.substring(0, 30)}...</p>
                            <p style="margin: 5px 0 0 0; font-size: 11px; color: #9ca3af;">Status: ${report.status}</p>
                        </div>
                    `
                });

                const marker = new window.google.maps.Marker({
                    map: map.current,
                    position: { lat: report.latitude, lng: report.longitude },
                    title: report.garbageType,
                    label: garbageTypeEmoji[report.garbageType],
                    animation: window.google.maps.Animation.DROP
                });

                // Show info window on marker click
                marker.addListener('click', () => {
                    infoWindow.open(map.current, marker);
                });
            });

            // Fit map bounds if reports exist
            if (reports.length > 0) {
                const bounds = new window.google.maps.LatLngBounds();
                bounds.extend({ lat: userLocation.latitude, lng: userLocation.longitude });
                reports.forEach(report => {
                    bounds.extend({ lat: report.latitude, lng: report.longitude });
                });
                map.current.fitBounds(bounds, 100);
            }
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    }, [apiLoaded, userLocation, reports]);

    if (!apiLoaded) {
        return (
            <div className="w-full h-96 rounded-lg shadow-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 p-6 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <p className="text-4xl mb-3">🗺️</p>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Loading Map...</h3>
                    <p className="text-gray-600 text-sm mb-4">
                        If the map doesn't load, check your Google Maps API key configuration.
                    </p>
                    <div className="animate-spin text-3xl inline-block">⏳</div>
                </div>
            </div>
        );
    }

    return (
        <div 
            ref={mapContainer} 
            className="w-full h-96 rounded-lg shadow-lg overflow-hidden bg-gray-200"
            style={{ minHeight: '400px' }}
        />
    );
}
