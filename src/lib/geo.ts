/**
 * Location privacy: coordinates are snapped to a 0.05° grid (~5 km) on the
 * device, before they are ever sent to the server.
 */
export const GRID_DEG = 0.05;

export function roundCoord(value: number, grid = GRID_DEG): number {
  return Math.round(Math.round(value / grid) * grid * 1e6) / 1e6;
}

export function roundLocation(lat: number, lng: number) {
  return { lat: roundCoord(lat), lng: roundCoord(lng) };
}

/** Great-circle distance in km (same formula as the database). */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Human label for a distance that's only accurate to ~5 km. */
export function distanceLabel(km: number | null): string | null {
  if (km === null || km === undefined) return null;
  if (km < 5) return "less than 5 km away";
  return `~${km} km away`;
}

/** Ask the browser for the device location and round it. */
export function getRoundedBrowserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Your browser doesn't support location."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(roundLocation(pos.coords.latitude, pos.coords.longitude)),
      (err) =>
        reject(
          new Error(
            err.code === err.PERMISSION_DENIED
              ? "Location permission was denied. You can still use Melt without distance."
              : "Couldn't get your location. Try again or skip.",
          ),
        ),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 },
    );
  });
}
