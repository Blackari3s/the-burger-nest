import { cartCents, validateCart, type CartLine } from "@/lib/order";

export const dynamic = "force-dynamic";

type PayBody = {
  sourceId?: string;
  idempotencyKey?: string;
  lines?: CartLine[];
  orderCode?: string;
};

export async function POST(request: Request) {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID || "LEAVZGBCWKDHG";
  if (!token) {
    return Response.json({ error: "Card payments are not configured." }, { status: 503 });
  }

  let body: PayBody;
  try {
    body = (await request.json()) as PayBody;
  } catch {
    return Response.json({ error: "The payment request was empty." }, { status: 400 });
  }

  if (!body.sourceId || !body.idempotencyKey || !Array.isArray(body.lines)) {
    return Response.json({ error: "The payment request was incomplete." }, { status: 400 });
  }

  const problem = validateCart(body.lines);
  if (problem) {
    return Response.json({ error: "Finish the order before paying." }, { status: 400 });
  }

  const amount = cartCents(body.lines);
  if (amount < 100) {
    return Response.json({ error: "The order total is too small to charge." }, { status: 400 });
  }

  const host =
    process.env.SQUARE_ENVIRONMENT === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

  const note = `Burger Nest ${body.orderCode ?? ""}`.trim().slice(0, 500);
  const squareResponse = await fetch(`${host}/v2/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Square-Version": "2025-01-23",
    },
    body: JSON.stringify({
      source_id: body.sourceId,
      idempotency_key: body.idempotencyKey,
      amount_money: { amount, currency: "USD" },
      location_id: locationId,
      autocomplete: true,
      note,
    }),
  });

  const payload = (await squareResponse.json()) as {
    payment?: { id?: string; status?: string };
    errors?: { detail?: string }[];
  };

  if (!squareResponse.ok) {
    const detail = payload.errors?.[0]?.detail || "Square did not charge the card.";
    return Response.json({ error: detail }, { status: 402 });
  }

  return Response.json({
    ok: true,
    paymentId: payload.payment?.id ?? null,
    total: amount,
  });
}
