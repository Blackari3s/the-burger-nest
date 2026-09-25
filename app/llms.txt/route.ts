import { buildLlms } from "@/lib/schema";

export function GET() {
  return new Response(buildLlms(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
