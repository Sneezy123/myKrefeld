import 'maplibre-gl/dist/maplibre-gl.css';
import '../../app/App.css';
import mapJSON from './maplibre-style.json';
import Marker from './marker.jsx';

import {
    RMap,
    RMarker,
    RPopup,
    RGeolocateControl,
    RNavigationControl,
} from 'maplibre-react-components';
import { useEffect, useState } from 'react';

export default function Map({ events }) {
    const [showPopup, setShowPopup] = useState(true);

    const [popupStates, setPopupStates] = useState({});

    const togglePopup = (eventId) => {
        setPopupStates((prevState) => ({
            ...prevState,
            [eventId]: !prevState[eventId],
        }));
    };

    return (
        <>
            <RMap
                style={{ minHeight: 200 }}
                mapStyle={mapJSON}
                initialCenter={[6.565411, 51.334534]} // Krefeld
                initialZoom={12.95}
                minZoom={12}
            >
                <RNavigationControl
                    position='top-right'
                    visualizePitch={true}
                />
                <RGeolocateControl
                    enableHighAccuracy={true}
                    showUserLocation={true}
                    showAccuracyCircle={true}
                    trackUserLocation={false}
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
                            <Marker />
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
            </RMap>
        </>
    );
}
