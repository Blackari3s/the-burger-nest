import type { Lang } from "@/data/menu";

/** Pick English or Spanish from the browser's Accept-Language header. Anything else stays English. */
export function langFromAccept(header: string | null): Lang {
  if (!header) return "en";

  let best: { lang: Lang; quality: number } | null = null;

  for (const part of header.split(",")) {
    const [rawTag, ...params] = part.trim().split(";");
    const tag = rawTag.toLowerCase();
    const base = tag.split("-")[0];
    if (base !== "en" && base !== "es") continue;

    const qualityParam = params.find((param) => param.trim().startsWith("q="));
    const quality = qualityParam ? Number(qualityParam.trim().slice(2)) : 1;
    if (!Number.isFinite(quality)) continue;
    if (!best || quality > best.quality) best = { lang: base, quality };
  }

  return best?.lang ?? "en";
}
