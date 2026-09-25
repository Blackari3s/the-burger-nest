import { getItem, menu, type Lang, type MenuItem } from "@/data/menu";
import { site, weeklyHours } from "@/data/site";

export function findItem(id: string) {
  return menu.find((entry) => entry.id === id);
}

export type Selection = { groupId: string; optionIds: string[] };

export type CartLine = {
  id: string;
  itemId: string;
  quantity: number;
  selections: Selection[];
};

export function activeGroups(item: MenuItem, selections: Selection[]) {
  return item.groups.filter((group) => {
    if (!group.showWhen) return true;
    const chosen = selections.find((selection) => selection.groupId === group.showWhen?.groupId);
    return chosen?.optionIds.includes(group.showWhen.optionId) ?? false;
  });
}

export function withDefaults(item: MenuItem, selections: Selection[]) {
  let next = selections.map((selection) => ({
    groupId: selection.groupId,
    optionIds: [...selection.optionIds],
  }));

  for (let pass = 0; pass < 4; pass += 1) {
    for (const group of activeGroups(item, next)) {
      if (next.some((selection) => selection.groupId === group.id)) continue;
      const defaults = group.options.filter((option) => option.isDefault).map((option) => option.id);
      if (defaults.length > 0) {
        next = [...next, { groupId: group.id, optionIds: defaults.slice(0, group.max) }];
      }
    }
  }

  return next;
}

export function toggleOption(
  item: MenuItem,
  selections: Selection[],
  groupId: string,
  optionId: string,
) {
  const group = item.groups.find((entry) => entry.id === groupId);
  if (!group) return selections;

  const current = selections.find((selection) => selection.groupId === groupId)?.optionIds ?? [];
  let optionIds: string[];

  if (group.max === 1) {
    if (current[0] === optionId && group.min === 0) optionIds = [];
    else optionIds = [optionId];
  } else if (current.includes(optionId)) {
    optionIds = current.filter((id) => id !== optionId);
  } else if (current.length >= group.max) {
    optionIds = current;
  } else {
    optionIds = [...current, optionId];
  }

  const without = selections.filter((selection) => selection.groupId !== groupId);
  const next = optionIds.length > 0 ? [...without, { groupId, optionIds }] : without;
  return withDefaults(item, next);
}

export function lineCents(item: MenuItem, selections: Selection[]) {
  const active = new Set(activeGroups(item, selections).map((group) => group.id));
  let cents = item.price;

  for (const selection of selections) {
    if (!active.has(selection.groupId)) continue;
    const group = item.groups.find((entry) => entry.id === selection.groupId);
    if (!group) continue;
    for (const optionId of selection.optionIds) {
      cents += group.options.find((option) => option.id === optionId)?.price ?? 0;
    }
  }

  return cents;
}

export function lineIssue(item: MenuItem, selections: Selection[]) {
  for (const group of activeGroups(item, selections)) {
    const count =
      selections.find((selection) => selection.groupId === group.id)?.optionIds.length ?? 0;
    if (count < group.min) return group.id === "drink" || group.id === "flavor" ? "drink" : "required";
    if (count > group.max) return "required";
  }
  return null;
}

export function cartCents(lines: CartLine[]) {
  return lines.reduce((sum, line) => {
    const item = getItem(line.itemId);
    return sum + lineCents(item, line.selections) * line.quantity;
  }, 0);
}

export function formatMoney(cents: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "es" ? "es-US" : "en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function describeLine(item: MenuItem, selections: Selection[], lang: Lang) {
  const parts: string[] = [];
  const active = new Set(activeGroups(item, selections).map((group) => group.id));

  for (const group of item.groups) {
    if (!active.has(group.id)) continue;
    const chosen = selections.find((selection) => selection.groupId === group.id);
    if (!chosen) continue;
    for (const optionId of chosen.optionIds) {
      const option = group.options.find((entry) => entry.id === optionId);
      if (option) parts.push(option.name[lang]);
    }
  }

  return parts.join(", ");
}

const weekdayIndex: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function newYorkClock(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: site.timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const hour = Number(read("hour"));
  const minute = Number(read("minute"));
  return {
    day: weekdayIndex[read("weekday")] ?? 0,
    minutes: (hour === 24 ? 0 : hour) * 60 + minute,
  };
}

export function pickupSlots(now = new Date()) {
  const start = now.getTime() + 25 * 60 * 1000;
  let cursor = Math.ceil(start / (15 * 60 * 1000)) * 15 * 60 * 1000;
  const slots: string[] = [];
  const limit = now.getTime() + 8 * 24 * 60 * 60 * 1000;

  while (slots.length < 20 && cursor < limit) {
    const clock = newYorkClock(new Date(cursor));
    const hours = weeklyHours[clock.day];
    if (
      hours &&
      hours.open !== null &&
      hours.close !== null &&
      clock.minutes >= hours.open &&
      clock.minutes < hours.close
    ) {
      slots.push(new Date(cursor).toISOString());
    }
    cursor += 15 * 60 * 1000;
  }

  return slots;
}

export function formatSlot(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "es" ? "es-US" : "en-US", {
    timeZone: site.timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function orderMessage(input: {
  lang: Lang;
  code: string;
  fulfillment: "pickup" | "delivery";
  paid: boolean;
  name: string;
  phone: string;
  whenLabel: string;
  address: string;
  notes: string;
  lines: CartLine[];
}) {
  const { lang } = input;
  const lines = input.lines.map((line) => {
    const item = getItem(line.itemId);
    const detail = describeLine(item, line.selections, lang);
    const price = formatMoney(lineCents(item, line.selections) * line.quantity, lang);
    const title = item.name[lang];
    return `${line.quantity} × ${title}${detail ? ` — ${detail}` : ""} — ${price}`;
  });

  const heading = lang === "es" ? "Pedido The Burger Nest" : "The Burger Nest order";
  const how =
    input.fulfillment === "delivery"
      ? lang === "es"
        ? "Entrega"
        : "Delivery"
      : lang === "es"
        ? "Recoger"
        : "Pickup";
  const pay = input.paid
    ? lang === "es"
      ? "Pagado con tarjeta"
      : "Paid by card"
    : lang === "es"
      ? "Pagar al recoger"
      : "Pay at pickup";

  return [
    heading,
    `${lang === "es" ? "Orden" : "Order"} ${input.code}`,
    how,
    pay,
    `${lang === "es" ? "Nombre" : "Name"}: ${input.name}`,
    `${lang === "es" ? "Teléfono" : "Phone"}: ${input.phone}`,
    `${lang === "es" ? "Hora" : "Time"}: ${input.whenLabel}`,
    input.fulfillment === "delivery"
      ? `${lang === "es" ? "Dirección" : "Address"}: ${input.address}`
      : "",
    input.fulfillment === "delivery"
      ? lang === "es"
        ? "El truck confirma el costo del envío y manda al conductor."
        : "The truck confirms the delivery fee and sends the driver."
      : "",
    "—",
    ...lines,
    `${lang === "es" ? "Total" : "Total"}: ${formatMoney(cartCents(input.lines), lang)}`,
    input.notes.trim()
      ? `${lang === "es" ? "Notas" : "Notes"}: ${input.notes.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function whatsappHref(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function validateCart(lines: CartLine[]) {
  if (lines.length === 0) return "empty";
  for (const line of lines) {
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 10) return "quantity";
    const item = menu.find((entry) => entry.id === line.itemId);
    if (!item) return "item";
    if (lineIssue(item, line.selections)) return "options";
  }
  return null;
}

