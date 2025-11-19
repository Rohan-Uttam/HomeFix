// frontend/src/utils/loadGoogleMaps.js
export const loadGoogleMaps = () => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      return resolve(window.google.maps);
    }

    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) return reject(new Error("Missing VITE_GOOGLE_MAPS_API_KEY"));

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.maps) return resolve(window.google.maps);
      reject(new Error("Google maps failed to load"));
    };
    script.onerror = () => reject(new Error("Google maps script error"));
    document.head.appendChild(script);
  });
};
