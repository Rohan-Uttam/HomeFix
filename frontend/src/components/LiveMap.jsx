// frontend/src/components/LiveMap.jsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { getSocket } from "../utils/socketClient";
import { useNavigate } from "react-router-dom";

// ✅ Helper: adjust map to show both markers
function FitBounds({ workerCoords, clientCoords }) {
  const map = useMap();
  useEffect(() => {
    if (workerCoords && clientCoords) {
      map.fitBounds([workerCoords, clientCoords], { padding: [50, 50] });
    } else if (workerCoords) {
      map.setView(workerCoords, 15);
    } else if (clientCoords) {
      map.setView(clientCoords, 15);
    }
  }, [workerCoords, clientCoords, map]);
  return null;
}

// ✅ Helper: haversine distance (in km)
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function LiveMap({ sessionId, onClose }) {
  const [workerCoords, setWorkerCoords] = useState(null);
  const [clientCoords, setClientCoords] = useState(null);
  const [eta, setEta] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setClientCoords([pos.coords.latitude, pos.coords.longitude]);
      });
    }

    const socket = getSocket();
    if (!socket) return;

    socket.emit("live:join", { sessionId });

    socket.on("live:update", ({ coords }) => {
      const newWorker = [coords.lat, coords.lng];
      setWorkerCoords(newWorker);

      if (clientCoords) {
        const distKm = getDistanceKm(
          newWorker[0],
          newWorker[1],
          clientCoords[0],
          clientCoords[1]
        );
        const speed = 20; // km/h
        const mins = Math.round((distKm / speed) * 60);
        setEta({ distance: distKm.toFixed(2), time: mins });
      }
    });

    return () => {
      socket.emit("live:leave", { sessionId });
      socket.off("live:update");
    };
  }, [sessionId, clientCoords]);

  const handleBack = () => {
    onClose();
    navigate("/client/bookings");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-sky-900/80 via-gray-900/80 to-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[92%] h-[82%] relative overflow-hidden border border-gray-200">
        {/* 🔙 Back + Close buttons */}
        <div className="absolute top-4 left-4 z-[1000] flex gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium shadow hover:scale-105 transition"
            onClick={handleBack}
          >
            ← Back
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow hover:scale-105 transition"
            onClick={onClose}
          >
            ✖ Close
          </button>
        </div>

        {/* ETA Display */}
        {eta && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-sky-500 to-purple-600 text-white px-5 py-2 rounded-full shadow-lg font-semibold text-sm z-[1000]">
            🚗 Worker is {eta.distance} km away — ETA ~ {eta.time} min
          </div>
        )}

        {/* Map */}
        <MapContainer
          center={clientCoords || [28.61, 77.23]}
          zoom={13}
          className="w-full h-full rounded-2xl"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {clientCoords && (
            <Marker position={clientCoords}>
              <Popup>📍 You (Client)</Popup>
            </Marker>
          )}
          {workerCoords && (
            <Marker position={workerCoords}>
              <Popup>🚗 Worker</Popup>
            </Marker>
          )}
          <FitBounds workerCoords={workerCoords} clientCoords={clientCoords} />
        </MapContainer>
      </div>
    </div>
  );
}
