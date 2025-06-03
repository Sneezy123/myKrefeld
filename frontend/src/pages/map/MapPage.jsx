import 'maplibre-gl/dist/maplibre-gl.css';

import mapJSON from './maplibre-style.json';

import {
    Map,
    Marker,
    GeolocateControl,
    NavigationControl,
    Popup,
} from 'maplibre-gl';
import { useRef, useEffect } from 'react';
import LocationMarker from './LocationMarker';
import { createRoot } from 'react-dom/client';

export default function MapPage({ events }) {
    const mapRef = useRef(null);
    const mapCRef = useRef(null);

    console.log('Map component rendering');

    useEffect(() => {
        console.log('Map component mounted');

        mapRef.current = new Map({
            container: mapCRef.current, // container id
            style: mapJSON,
            center: [6.565411, 51.334534], // starting position
            zoom: 12.95, // starting zoom
            minZoom: 12,
        });
        mapRef.current.addControl(
            new NavigationControl({ visualizePitch: true }),
            'top-right'
        );
        // Add geolocate control to the map.
        mapRef.current.addControl(
            new GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
            }),
            'top-right'
        );

        return () => {
            mapRef.current.remove();
            console.log('Map component unmounted');
        };
    }, []);

    useEffect(() => {
        let map = mapRef.current;
        let eventMarkers = [];

        events.forEach((event) => {
            const markerElement = document.createElement('div');

            const root = createRoot(markerElement);
            root.render(<LocationMarker />);

            const longitude = isNaN(event.venue?.lon) ? 0 : event.venue?.lon;
            const latitude = isNaN(event.venue?.lat) ? 0 : event.venue?.lat;
            console.log(longitude, latitude);
            let eventMarker = new Marker({ element: markerElement })
                .setLngLat([longitude, latitude])
                .setPopup(
                    new Popup({
                        closeOnClick: true,
                        offset: 10,
                        focusAfterOpen: false,
                    })
                        .setLngLat([longitude, latitude])
                        .setHTML(
                            `<a href="/discover/#${event.id}"><strong>${event.title}</strong></a>`
                        )
                );
            eventMarkers.push(eventMarker);
            eventMarker.addTo(map);
        });
        console.log('Markers created');
        return () => {
            eventMarkers.forEach((eventMarker) => {
                eventMarker.remove();
            });
            eventMarkers = [];
            console.log('Markers removed');
        };
    }, [events]);

    return <div className='w-full h-full relative' ref={mapCRef}></div>;
}
