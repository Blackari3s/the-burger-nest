import { cookies } from "next/headers";
import { Home } from "@/components/home";
import type { Lang } from "@/data/menu";
import { buildJsonLd } from "@/lib/schema";
import type { SquareConfig } from "@/components/square-pay";

export const dynamic = "force-dynamic";

function squareConfig(): SquareConfig {
  const applicationId = process.env.SQUARE_APPLICATION_ID ?? "";
  const locationId = process.env.SQUARE_LOCATION_ID || "LEAVZGBCWKDHG";
  const enabled = Boolean(applicationId && process.env.SQUARE_ACCESS_TOKEN);
  return {
    enabled,
    applicationId,
    locationId,
    environment: process.env.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox",
  };
}

export default async function Page() {
  const jar = await cookies();
  const lang: Lang = jar.get("bn-lang")?.value === "es" ? "es" : "en";
  const jsonLd = buildJsonLd();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Home initialLang={lang} square={squareConfig()} />
    </>
  );
}
