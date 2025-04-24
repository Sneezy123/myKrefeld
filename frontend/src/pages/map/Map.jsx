import "maplibre-gl/dist/maplibre-gl.css";
import mapJSON from './maplibre-style.json'

import { RMap } from "maplibre-react-components";

export default function Map() {
    return (
        <RMap
        style={{ minHeight: 200 }}
        mapStyle={mapJSON}
        center={[6.565411, 51.334534]} // Krefeld
        initialZoom={13}
        minZoom={12}
    />
    );
}