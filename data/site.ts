export const site = {
  name: "The Burger Nest",
  phoneDisplay: "(813) 938-0369",
  phoneTel: "+18139380369",
  whatsapp: "18139380369",
  street: "6055 W Waters Ave",
  city: "Tampa",
  region: "FL",
  postalCode: "33634",
  country: "US",
  neighborhood: "Town 'n' Country, by the Marathon and Chick-fil-A",
  geo: { latitude: 28.0265, longitude: -82.5465 },
  timezone: "America/New_York",
  instagram: "https://www.instagram.com/theburgernest/",
  tiktok: "https://www.tiktok.com/@the.burger.nest",
  doorDashUrl: "https://www.doordash.com/store/35728615",
  uberEatsUrl:
    "https://www.ubereats.com/store-browse-uuid/56c5b6e7-103c-524f-820f-f9ae878b46ff?diningMode=DELIVERY",
  /** Paste the DoorDash Online Ordering link here when it is turned on. It replaces the marketplace DoorDash button. */
  doorDashOnlineOrderingUrl: "",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=6055+W+Waters+Ave+Tampa+FL+33634",
  mapsEmbed:
    "https://maps.google.com/maps?q=6055+W+Waters+Ave,+Tampa,+FL+33634&z=16&output=embed",
} as const;

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

/** Minutes from midnight. Null means closed. Sunday = 0. */
export const weeklyHours: { open: number | null; close: number | null }[] = [
  { open: null, close: null },
  { open: null, close: null },
  { open: 11 * 60, close: 20 * 60 },
  { open: 11 * 60, close: 20 * 60 },
  { open: 11 * 60, close: 20 * 60 },
  { open: 11 * 60, close: 20 * 60 },
  { open: 18 * 60, close: 23 * 60 },
];

export const hourLines = [
  {
    en: "Tuesday–Friday · 11:00 am – 8:00 pm",
    es: "Martes a viernes · 11:00 a. m. – 8:00 p. m.",
  },
  {
    en: "Saturday · 6:00 pm – 11:00 pm",
    es: "Sábado · 6:00 p. m. – 11:00 p. m.",
  },
  {
    en: "Sunday and Monday · Closed",
    es: "Domingo y lunes · Cerrado",
  },
] as const;
