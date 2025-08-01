import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import MarkerPopup from './MarkerPopup';
import Supercluster from 'supercluster';
import { useRef, useEffect } from 'react';
import LocationMarker from './LocationMarker';
import { renderToString } from 'react-dom/server';
import { createRoot } from 'react-dom/client';

export default function MapPage({ events }) {
    // Refs remain the same
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef({});
    const clusterIndexRef = useRef(null);

    // --- HELPER FUNCTIONS (Extracted for clarity) ---

    // This function now handles adding all markers and clusters
    const updateMarkersAndClusters = () => {
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

        const newMarkers = {};

        // Compare new clusters with existing markers to avoid re-rendering everything
        const currentMarkerIds = Object.keys(markersRef.current);
        const newClusterIds = clusters.map((c) => {
            return c.properties.cluster ?
                    `cluster-${c.properties.cluster_id}`
                :   `event-${c.properties.eventId}`;
        });

        // 1. Remove old markers that are no longer in view
        currentMarkerIds.forEach((id) => {
            if (!newClusterIds.includes(id)) {
                markersRef.current[id].remove();
                delete markersRef.current[id];
            }
        });

        // 2. Add new markers
        clusters.forEach((cluster) => {
            const [lng, lat] = cluster.geometry.coordinates;
            const isCluster = cluster.properties.cluster;
            const clusterId =
                isCluster ?
                    `cluster-${cluster.properties.cluster_id}`
                :   `event-${cluster.properties.eventId}`;

            // If marker already exists, don't re-create it
            if (markersRef.current[clusterId]) {
                return;
            }

            let element;
            let popup = null;

            if (isCluster) {
                // It's a cluster
                const count = cluster.properties.point_count;
                const clusterHTML = renderToString(
                    <div className='w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold border-2 border-primary-600 dark:border-primary-400'>
                        {count}
                    </div>
                );
                const clusterElement = document.createElement('div');
                clusterElement.innerHTML = clusterHTML;
                element = clusterElement.firstChild;

                element.style.cursor = 'pointer';
                element.onclick = () => {
                    const expansionZoom = Math.min(
                        clusterIndex.getClusterExpansionZoom(
                            cluster.properties.cluster_id
                        ),
                        map.getMaxZoom()
                    );
                    map.easeTo({ center: [lng, lat], zoom: expansionZoom });
                };
            } else {
                // It's a single event
                element = document.createElement('div');
                element.innerHTML = renderToString(<LocationMarker />);

                const popupDiv = document.createElement('div');
                createRoot(popupDiv).render(<MarkerPopup cluster={cluster} />);
                popup = new maplibregl.Popup({
                    closeOnClick: true,
                    closeButton: false,
                    offset: 10,
                    focusAfterOpen: false,
                }).setDOMContent(popupDiv);
            }

            const marker = new maplibregl.Marker({ element })
                .setLngLat([lng, lat])
                .addTo(map);

            if (popup) {
                marker.setPopup(popup);
            }

            markersRef.current[clusterId] = marker;
        });
    };

    // --- LIFECYCLE HOOKS ---

    // 1. Main useEffect for map initialization and teardown
    useEffect(() => {
        if (mapRef.current) return; // Initialize map only once

        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: 'https://tiles.openfreemap.org/styles/bright',
            center: [6.565411, 51.334534],
            zoom: 12.95,
            minZoom: 12,
        });

        mapRef.current = map;

        // The 'load' event listener is now set up only ONCE.
        map.on('load', () => {
            // Add controls after load
            map.addControl(
                new maplibregl.NavigationControl({ visualizePitch: true }),
                'top-right'
            );
            map.addControl(
                new maplibregl.GeolocateControl({
                    positionOptions: { enableHighAccuracy: true },
                    trackUserLocation: true,
                }),
                'top-right'
            );

            // If cluster data is already available, render the markers
            if (clusterIndexRef.current) {
                updateMarkersAndClusters();
            }

            // The 'moveend' event now correctly triggers updates
            map.on('moveend', updateMarkersAndClusters);
        });

        // The single, unified cleanup function
        return () => {
            const mapInstance = mapRef.current;
            if (mapInstance) {
                // The cleanup order is now guaranteed to be correct.
                // 1. Remove event listeners
                mapInstance.off('moveend', updateMarkersAndClusters);

                // 2. Remove all markers
                Object.values(markersRef.current).forEach((marker) =>
                    marker.remove()
                );
                markersRef.current = {};

                // 3. Finally, remove the map instance itself
                mapInstance.remove();
                mapRef.current = null;
            }
        };
    }, []); // Empty dependency array ensures this runs only once on mount and unmount

    // 2. useEffect for handling changes in the `events` prop
    useEffect(() => {
        if (!events) return;

        const features = events
            .filter((event) => event.venue?.lon && event.venue?.lat)
            .map((event) => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [event.venue.lon, event.venue.lat],
                },
                properties: { eventId: event.id, eventTitle: event.title },
            }));

        clusterIndexRef.current = new Supercluster({ radius: 60, maxZoom: 17 });
        clusterIndexRef.current.load(features);

        // If the map is already loaded and ready, trigger an update.
        // `isStyleLoaded` is a safe way to check if the map is ready for interaction.
        if (mapRef.current && mapRef.current.isStyleLoaded()) {
            updateMarkersAndClusters();
        }
        // No cleanup is needed here because the main useEffect handles it all.
    }, [events]);

    return <div className='w-full h-full relative' ref={mapContainerRef}></div>;
}
