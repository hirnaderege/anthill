import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import { Props } from "./RouteMap.types";

// Leaflet's default marker icons reference image files in a way that breaks
// when bundled by Metro/webpack — this manually points them at a working CDN.
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Leaflet's map instance isn't controlled via props the way MapView is —
// this small helper component reaches into the map imperatively to recenter it.
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng]);
  return null;
}

export default function RouteMap({ routes, selectedID, onSelectedRoute, region, userLocation }: Props) {
  const selected = routes.find((r) => r.id === selectedID);

  return (
    <MapContainer
      center={[region.latitude, region.longitude]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap lat={region.latitude} lng={region.longitude} />

      {[...routes]
        .sort((a, b) => (a.id === selectedID ? 1 : b.id === selectedID ? -1 : 0))
        .map((r) => (
          <Polyline
            key={r.id}
            positions={r.coordinates.map((c) => [c.latitude, c.longitude])}
            pathOptions={{
              color: r.id === selectedID ? "#2E8B57" : "#bbb",
              weight: r.id === selectedID ? 5 : 3,
            }}
            eventHandlers={{ click: () => onSelectedRoute(r.id) }}
          />
        ))}

      {userLocation && (
        <Marker position={[userLocation.latitude, userLocation.longitude]} icon={defaultIcon} />
      )}

      {selected && (
        <>
          <Marker
            position={[selected.coordinates[0].latitude, selected.coordinates[0].longitude]}
            icon={defaultIcon}
          />
          <Marker
            position={[
              selected.coordinates[selected.coordinates.length - 1].latitude,
              selected.coordinates[selected.coordinates.length - 1].longitude,
            ]}
            icon={defaultIcon}
          />
        </>
      )}
    </MapContainer>
  );
}