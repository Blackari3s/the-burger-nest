import { headers } from "next/headers";
import { Home } from "@/components/home";
import { buildJsonLd } from "@/lib/schema";
import { langFromAccept } from "@/lib/locale";
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
  const lang = langFromAccept((await headers()).get("accept-language"));
  const jsonLd = buildJsonLd();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Home initialLang={lang} square={squareConfig()} />
    </>
  );
}
