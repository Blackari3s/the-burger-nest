import type { Lang } from "@/data/menu";

export function persistLang(next: Lang) {
  document.cookie = `bn-lang=${next};path=/;max-age=31536000;samesite=lax`;
  document.documentElement.lang = next;
}
