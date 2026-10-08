import photos from "@/data/cars.json";
import details from "@/data/vehicle-details.json";
import bookings from "@/data/demo-bookings.json";

export type Language = "th" | "en" | "zh";
export const categories = ["All", "Sports", "Supercar", "Ultra-Luxury", "SUV"] as const;
export const locations = ["bangkok", "bkk", "dmk", "hotel"] as const;
export type Vehicle = (typeof details)[number] & (typeof photos)[number];
export type RentalQuery = { pickup: string; returnAt: string; location: string; category: string; service: string };
export const fleet: Vehicle[] = details.map((vehicle) => {
  const photo = photos.find((item) => item.name === vehicle.name);
  if (!photo) throw new Error(`Missing photo metadata for ${vehicle.slug}`);
  return { ...photo, ...vehicle };
});
export const locale = (language: Language) => ({ th: "th-TH", en: "en-GB", zh: "zh-CN" })[language];
export const money = (value: number, language: Language) => new Intl.NumberFormat(locale(language), { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(value);
export const localized = (vehicle: Vehicle, field: "summary" | "features" | "rental_terms", language: Language) => vehicle[`${field}_${language}`];
export function rentalDays(query: RentalQuery) {
  return Math.ceil((Date.parse(query.returnAt) - Date.parse(query.pickup)) / 86_400_000);
}
export function queryError(query: RentalQuery, now = Date.now()): "dates" | "past" | null {
  const start = Date.parse(query.pickup), end = Date.parse(query.returnAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return "dates";
  if (start < now) return "past";
  return null;
}
// Demonstration only: half-open intervals [pickup, return), Bangkok time.
// Replace with an authoritative server response before accepting real reservations.
export function matchesRental(vehicle: Vehicle, query: RentalQuery) {
  const start = Date.parse(query.pickup), end = Date.parse(query.returnAt);
  return vehicle.fleet_status === "active"
    && (query.category === "All" || vehicle.category === query.category)
    && vehicle.service_modes.includes(query.service)
    && vehicle.delivery_locations.includes(query.location)
    && rentalDays(query) >= vehicle.minimum_days
    && !bookings.some((booking) => booking.vehicle_slug === vehicle.slug
      && booking.status === "confirmed" && start < Date.parse(booking.end) && end > Date.parse(booking.start));
}
export function rentalAmount(vehicle: Vehicle, query: RentalQuery | null) {
  // Chauffeur and event tariffs are not the self-drive daily rate.
  if (!vehicle.service_modes.includes("self-drive") || (query && query.service !== "self-drive")) return null;
  return vehicle.daily_rate_thb * (query ? rentalDays(query) : 1);
}
