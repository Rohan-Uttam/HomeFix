// backend/services/recommendService.js
import WorkerProfile from "../models/WorkerProfile.js";
import { haversineDistance } from "../utils/geoUtils.js";

export async function recommendWorkers({
  clientCoords,
  category,
  skills = [],
  limit = 3,
}) {
  const workers = await WorkerProfile.find({
    category,
    skills: { $in: skills.length > 0 ? skills : [] },
  }).populate("user", "name email phone avatar location");

  const scored = workers.map((w) => {
    // normalize rating
    const ratingScore = (w.rating || 0) / 5;

    // skill match fraction
    const skillMatch =
      skills.length > 0
        ? w.skills.filter((s) => skills.includes(s)).length / skills.length
        : 0.5; // neutral if no skills given

    // distance score
    let distance = 9999;
    let distanceScore = 0;
    if (
      clientCoords &&
      w.location?.coordinates?.length === 2 &&
      Array.isArray(w.location.coordinates)
    ) {
      distance = haversineDistance(
        clientCoords,
        w.location.coordinates.slice(0, 2)
      );
      distanceScore = distance <= 50 ? 1 - distance / 50 : 0; // scale within 50 km
    }

    // availability score
    const availabilityScore = w.availability ? 1 : 0;

    // weighted total
    const score =
      0.45 * ratingScore +
      0.35 * skillMatch +
      0.15 * distanceScore +
      0.05 * availabilityScore;

    return {
      worker: w,
      score,
      distance: Number(distance.toFixed(1)),
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}
