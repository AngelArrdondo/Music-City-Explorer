import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import DefaultIcon from "../icon"; // Asegúrate de que esta ruta sea correcta

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 12, { animate: true, duration: 2 });
    }
  }, [center, map]);
  return null;
}

export default function MapView({ onLocationFound, center }) {
  
  const handleLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => onLocationFound(pos.coords.latitude, pos.coords.longitude),
      () => alert("No se pudo obtener tu ubicación")
    );
  };

  return (
    <div style={{ position: "relative", height: "400px", borderRadius: "12px", overflow: "hidden" }}>
      <button
        onClick={handleLocation}
        style={{
          position: "absolute", top: "10px", right: "10px", zIndex: 1000,
          padding: "10px", background: "#fff", border: "none", borderRadius: "5px",
          cursor: "pointer", fontWeight: "bold", boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
        }}
      >
        📍 Ubicación Actual
      </button>

      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ChangeView center={center} />
        <Marker position={center} icon={DefaultIcon}>
          <Popup>¡Aquí es!</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}