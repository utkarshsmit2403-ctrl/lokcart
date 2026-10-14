// Hyperlocal (3-hour runner) delivery is only offered when the customer's
// delivery location is within this radius of the artisan/district hub.
// Every product already carries a `distanceKm` computed server-side
// (see /api/products) relative to the user's saved delivery coordinates,
// so we reuse that value instead of recalculating distance client-side.
export const HYPERLOCAL_MAX_KM = 12;

/**
 * Determines whether hyperlocal (3-hour runner) delivery can be offered
 * for a given cart, based on the user's saved delivery location and the
 * distance of the farthest item in the cart from its artisan hub.
 *
 * Returns { eligible, hasLocation, maxDistanceKm, reason }
 */
export function getHyperlocalEligibility(cart, userLocation) {
  if (!userLocation || !userLocation.city) {
    return {
      eligible: false,
      hasLocation: false,
      maxDistanceKm: null,
      reason: "Set your delivery location to check hyperlocal availability.",
    };
  }

  const distances = (cart || [])
    .map((item) => item.product?.distanceKm)
    .filter((d) => typeof d === "number" && !isNaN(d));

  const maxDistanceKm = distances.length ? Math.max(...distances) : null;

  if (maxDistanceKm === null) {
    return {
      eligible: true,
      hasLocation: true,
      maxDistanceKm: null,
      reason: null,
    };
  }

  if (maxDistanceKm > HYPERLOCAL_MAX_KM) {
    return {
      eligible: false,
      hasLocation: true,
      maxDistanceKm,
      reason: `You're ${maxDistanceKm} km from the artisan hub — hyperlocal 3-hour delivery only covers ${HYPERLOCAL_MAX_KM} km.`,
    };
  }

  return {
    eligible: true,
    hasLocation: true,
    maxDistanceKm,
    reason: null,
  };
}