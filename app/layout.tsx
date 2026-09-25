import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { site, siteUrl } from "@/data/site";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Burger Nest | Food truck in Tampa",
    template: "%s | The Burger Nest",
  },
  description:
    "Family food truck at 6055 W Waters Ave, Tampa. Smashed burgers with bacon, Philly cheesesteaks, wings, and Cuban plates. Order pickup on this page.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "The Burger Nest | Food truck in Tampa",
    description:
      "Smashed burgers, Philly cheesesteaks, wings, and Cuban plates. Pickup from the truck on Waters Ave.",
    images: [{ url: "/menu/double-combo.jpeg", width: 1200, height: 1200, alt: "Double cheeseburger from The Burger Nest" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Burger Nest | Food truck in Tampa",
    description: "Burgers, Phillys, wings, and Cuban plates at 6055 W Waters Ave.",
    images: ["/menu/double-combo.jpeg"],
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const jar = await cookies();
  const lang = jar.get("bn-lang")?.value === "es" ? "es" : "en";

  return (
    <html lang={lang} className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full">
        <a
          href="#menu"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-cream focus:px-4 focus:py-2"
        >
          {lang === "es" ? "Saltar al menú" : "Skip to menu"}
        </a>
        {children}
        <p className="sr-only">
          {site.name}, {site.street}, {site.city}, {site.region} {site.postalCode}. {site.phoneDisplay}.
        </p>
      </body>
    </html>
  );
}
