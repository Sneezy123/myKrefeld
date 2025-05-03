import 'maplibre-gl/dist/maplibre-gl.css';
import '../../app/App.css';
import mapJSON from './maplibre-style.json';

import { RMap, RMarker } from 'maplibre-react-components';
import { useEffect, useState } from 'react';

export default function Map({ events }) {
    const [addresses, setAddresses] = useState([]);

    useEffect(() => {
        const fetchAdresses = async () => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?street=${encodeURIComponent(address)}&city=${encodeURIComponent(city)}&country=Germany&postalcode=${encodeURIComponent(zipCode)}&accept-language=de&countrycodes=de&format=json`
                );
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                // Sort events by start date

                setAddresses(data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchAdresses();
    }, []);

    const addresses = ['Krefeld'];

    return (
        <>
            {addresses.map((address) => (
                <RMap
                    style={{ minHeight: 200 }}
                    mapStyle={mapJSON}
                    initialCenter={[6.565411, 51.334534]} // Krefeld
                    initialZoom={12.95}
                    minZoom={12}
                />
            ))}
        </>
    );
}

async function requestAddress(address) {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`
    );
    const data = await response.json();
}
