import 'maplibre-gl/dist/maplibre-gl.css';
import '../../app/App.css';
import mapJSON from './maplibre-style.json';
import Marker from './LocationMarker.jsx';
import UserLocationMarker from './UserPositionMarker.jsx';

import {
    RMap,
    RMarker,
    RPopup,
    RGeolocateControl,
    RNavigationControl,
} from 'maplibre-react-components';
import { useRef, useState, useEffect } from 'react';
import { AttributionControl } from 'maplibre-gl';

export default function Map({ events }) {
    const [showPopup, setShowPopup] = useState(true);
    const [showGeolocate, setShowGeolocate] = useState(false);
    const geolocateRef = useRef(null);
    const mapRef = useRef(null);
    const [popupStates, setPopupStates] = useState({});
    const [userLocation, setUserLocation] = useState(null);

    const togglePopup = (eventId) => {
        setPopupStates((prevState) => ({
            ...prevState,
            [eventId]: !prevState[eventId],
        }));
    };

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => console.log('✅ Got location:', pos),
            (err) => console.error('❌ Geolocation error:', err)
        );
    }, []);

    return (
        <div className='w-full h-full overflow-hidden scrollbar-hidden'>
            <RMap
                ref={mapRef}
                style={{ minHeight: 200 }}
                mapStyle={mapJSON}
                initialCenter={[6.565411, 51.334534]} // Krefeld
                initialZoom={12.95}
                minZoom={12}
                initialAttributionControl={false}
            >
                <RNavigationControl
                    position='top-right'
                    visualizePitch={true}
                />

                {events.map((event) => (
                    <>
                        <RMarker
                            key={event.id}
                            longitude={event.venue?.lon}
                            latitude={event.venue?.lat}
                            rotation={0}
                            initialAnchor='bottom'
                            onClick={(e) => {
                                e.stopPropagation();
                                setPopupStates((prevState) => {
                                    const isCurrentlyOpen = prevState[event.id];
                                    return { [event.id]: !isCurrentlyOpen };
                                });
                            }}
                        >
                            <Marker className='size-2' />
                        </RMarker>

                        {popupStates[event.id] && (
                            <RPopup
                                longitude={event.venue?.lon}
                                latitude={event.venue?.lat}
                                offset={15}
                                onClose={() =>
                                    setPopupStates((prevState) => ({
                                        ...prevState,
                                        [event.id]: false,
                                    }))
                                }
                            >
                                <a
                                    href={`/discover/#${event.id}`} // Use the fragment identifier
                                    className='font-bold font-stretch-semi-expanded'
                                    dangerouslySetInnerHTML={{
                                        __html: event.title,
                                    }}
                                ></a>
                            </RPopup>
                        )}
                    </>
                ))}
                {userLocation && (
                    <RMarker
                        longitude={userLocation.lon}
                        latitude={userLocation.lat}
                        initialAnchor='center'
                    >
                        <UserLocationMarker />
                    </RMarker>
                )}

                {showGeolocate && (
                    <RGeolocateControl
                        ref={geolocateRef}
                        enableHighAccuracy={true}
                        showUserLocation={true}
                        showAccuracyCircle={true}
                        trackUserLocation={false}
                    />
                )}
            </RMap>
            <button
                onClick={() => {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            const { latitude, longitude } = pos.coords;
                            setUserLocation({ lat: latitude, lon: longitude });
                            mapRef.current?.jumpTo({
                                center: [longitude, latitude],
                                zoom: 15,
                            });
                        },
                        (err) => {
                            console.error('Geolocation error:', err);
                            alert('Could not get your location.');
                        },
                        { enableHighAccuracy: true }
                    );
                }}
                className='fixed bottom-5 right-5 z-50 bg-black text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:bg-neutral-800 transition text-xl'
            >
                📍
            </button>
        </div>
    );
}
