import { categories, menu } from "@/data/menu";
import { hourLines, site, siteUrl, weeklyHours } from "@/data/site";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function clock(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function buildJsonLd() {
  const hours = weeklyHours.flatMap((entry, index) => {
    if (entry.open === null || entry.close === null) return [];
    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: dayNames[index],
        opens: clock(entry.open),
        closes: clock(entry.close),
      },
    ];
  });

  return {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: site.name,
    url: siteUrl,
    image: `${siteUrl}/menu/double-combo.jpeg`,
    telephone: site.phoneTel,
    servesCuisine: ["American", "Cuban", "Burgers"],
    priceRange: "$",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.street,
      addressLocality: site.city,
      addressRegion: site.region,
      postalCode: site.postalCode,
      addressCountry: site.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    openingHoursSpecification: hours,
    hasMenu: {
      "@type": "Menu",
      hasMenuSection: categories.map((category) => ({
        "@type": "MenuSection",
        name: category.name.en,
        description: category.blurb.en,
        hasMenuItem: menu
          .filter((item) => item.category === category.id)
          .map((item) => ({
            "@type": "MenuItem",
            name: item.name.en,
            description: item.description.en,
            image: item.image ? `${siteUrl}${item.image}` : undefined,
            offers: {
              "@type": "Offer",
              priceCurrency: "USD",
              price: (item.fromPrice / 100).toFixed(2),
            },
          })),
      })),
    },
    sameAs: [site.instagram, site.tiktok, site.doorDashUrl, site.uberEatsUrl],
  };
}

export function buildLlms() {
  const lines = [
    `# ${site.name}`,
    "",
    "Family food truck in Tampa. Smashed burgers with bacon, Philly cheesesteaks, wings, and Cuban plates.",
    "",
    `Address: ${site.street}, ${site.city}, ${site.region} ${site.postalCode}`,
    `Phone: ${site.phoneDisplay}`,
    `Pickup orders: ${siteUrl}/#order`,
    `Menu: ${siteUrl}/#menu`,
    "",
    "Hours (America/New_York):",
    ...hourLines.map((line) => `- ${line.en}`),
    "Hours can change. Call or check Instagram before visiting.",
    "",
    "How to order:",
    "- Pickup is built on this website. Pay at the truck, or by card through the truck's Square account when that is turned on. The ticket is sent to the truck on WhatsApp.",
    `- Delivery requests can be sent to the truck from this website. DoorDash: ${site.doorDashUrl}`,
    `- Uber Eats: ${site.uberEatsUrl}`,
    "",
    "Menu, starting prices in USD:",
  ];

  for (const category of categories) {
    lines.push("", `## ${category.name.en}`, category.blurb.en);
    for (const item of menu.filter((entry) => entry.category === category.id)) {
      lines.push(`- ${item.name.en}: from $${(item.fromPrice / 100).toFixed(2)}. ${item.description.en}`);
    }
  }

  lines.push(
    "",
    `Instagram: ${site.instagram}`,
    `TikTok: ${site.tiktok}`,
  );

  return lines.join("\n");
}
