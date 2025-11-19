// utils/geocode.js

//  Reverse geocoding with LocationIQ
export const getCurrentLocation = async () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation not supported"));
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://us1.locationiq.com/v1/reverse.php?key=${
              import.meta.env.VITE_LOCATIONIQ_KEY
            }&lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();

          resolve({
            lat: latitude,
            lng: longitude,
            address: data.display_name || "",
          });
        } catch (err) {
          reject(new Error("Failed to fetch address"));
        }
      },
      (err) => reject(err)
    );
  });
};

//  Forward geocoding (for search box)
export const searchAddress = async (query) => {
  try {
    const res = await fetch(
      `https://us1.locationiq.com/v1/search.php?key=${
        import.meta.env.VITE_LOCATIONIQ_KEY
      }&q=${encodeURIComponent(query)}&format=json`
    );
    return await res.json();
  } catch (err) {
    console.error("Forward geocode failed:", err);
    return [];
  }
};
