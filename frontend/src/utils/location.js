// frontend/src/utils/location.js
export default function getUserLocation(withAddress = false) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation not supported"));
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (!withAddress) {
          return resolve({ lat, lng });
        }

        try {
          // 🌍 Reverse geocoding via OpenStreetMap (Nominatim API)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          const address = data?.display_name || "";

          resolve({ lat, lng, address });
        } catch (e) {
          console.error("Failed to fetch address:", e);
          resolve({ lat, lng, address: "" }); // fallback
        }
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}
