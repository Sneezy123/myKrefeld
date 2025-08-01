import 'maplibre-gl/dist/maplibre-gl.css';

import maplibregl from 'maplibre-gl';
import MarkerPopup from './MarkerPopup';
import Supercluster from 'supercluster';
import { useRef, useEffect } from 'react';
import LocationMarker from './LocationMarker'; // For single event markers
import { renderToString } from 'react-dom/server';
import { createRoot } from 'react-dom/client';

export default function MapPage({ events }) {
    const mapRef = useRef(null);
    const mapCRef = useRef(null);
    const markersRef = useRef({}); // id -> marker
    const clusterIndexRef = useRef(null);

    // 1. Initialize the map only once
    useEffect(() => {
        mapRef.current = new maplibregl.Map({
            container: mapCRef.current,
            style: 'https://tiles.openfreemap.org/styles/bright',
            center: [6.565411, 51.334534],
            zoom: 12.95,
            minZoom: 12,
        });
        mapRef.current.addControl(
            new maplibregl.NavigationControl({ visualizePitch: true }),
            'top-right'
        );
        mapRef.current.addControl(
            new maplibregl.GeolocateControl({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: true,
            }),
            'top-right'
        );
        return () => {
            mapRef.current.remove();
        };
    }, []);

    // 2. Prepare supercluster index from events
    useEffect(() => {
        if (!events || events.length === 0) return;

        const features = events
            .filter(
                (event) => !isNaN(event.venue?.lon) && !isNaN(event.venue?.lat)
            )
            .map((event) => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [event.venue.lon, event.venue.lat],
                },
                properties: {
                    eventId: event.id,
                    eventTitle: event.title,
                },
            }));

        clusterIndexRef.current = new Supercluster({
            radius: 60,
            maxZoom: 17,
        });
        clusterIndexRef.current.load(features);

        // Initial cluster render
        if (mapRef.current) {
            renderClusters();
            mapRef.current.on('moveend', renderClusters);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.off('moveend', renderClusters);
            }
            clearAllMarkers();
        };
        // eslint-disable-next-line
    }, [events]);

    // 3. Render clusters and single markers
    function renderClusters() {
        clearAllMarkers();
        const map = mapRef.current;
        const clusterIndex = clusterIndexRef.current;
        if (!map || !clusterIndex) return;

        const bounds = map.getBounds();
        const bbox = [
            bounds.getWest(),
            bounds.getSouth(),
            bounds.getEast(),
            bounds.getNorth(),
        ];
        const zoom = Math.round(map.getZoom());

        const clusters = clusterIndex.getClusters(bbox, zoom);

        clusters.forEach((cluster) => {
            const [lng, lat] = cluster.geometry.coordinates;

            if (cluster.properties.cluster) {
                // It's a cluster - render as React so Tailwind classes work!
                const count = cluster.properties.point_count;
                const clusterId = cluster.properties.cluster_id;

                // Create a React element and render to string, so TW classes work
                const clusterHTML = renderToString(
                    <div className='w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold border-2 border-primary-600 dark:border-primary-400'>
                        {count}
                    </div>
                );
                const clusterElement = document.createElement('div');
                clusterElement.innerHTML = clusterHTML;

                // Ensure the element is the React rendered div
                const element = clusterElement.firstChild;

                element.style.cursor = 'pointer';
                element.onclick = () => {
                    // Zoom in on cluster click
                    const expansionZoom = Math.min(
                        clusterIndex.getClusterExpansionZoom(clusterId),
                        map.getMaxZoom()
                    );
                    map.easeTo({
                        center: [lng, lat],
                        zoom: expansionZoom,
                    });
                };
                map.on('load', () => {
                    const marker = new maplibregl.Marker({ element })
                        .setLngLat([lng, lat])
                        .addTo(map);

                    markersRef.current[`cluster-${clusterId}`] = marker;
                });
            } else {
                // It's a single event
                const markerElement = document.createElement('div');
                markerElement.innerHTML = renderToString(<LocationMarker />);
                const popupDiv = document.createElement('div');
                const root = createRoot(popupDiv);
                root.render(<MarkerPopup cluster={cluster} />);
                const popup = new maplibregl.Popup({
                    closeOnClick: true,
                    closeButton: false,
                    offset: 10,
                    focusAfterOpen: false,
                }).setDOMContent(popupDiv);

                map.on('load', () => {
                    const marker = new maplibregl.Marker({
                        element: markerElement,
                    })
                        .setLngLat([lng, lat])
                        .setPopup(popup)
                        .addTo(map);

                    markersRef.current[`event-${cluster.properties.eventId}`] =
                        marker;
                });
            }
        });
    }

    // 4. Remove all map markers
    function clearAllMarkers() {
        Object.values(markersRef.current).forEach((marker) => marker.remove());
        markersRef.current = {};
    }

    return <div className='w-full h-full relative' ref={mapCRef}></div>;
}
