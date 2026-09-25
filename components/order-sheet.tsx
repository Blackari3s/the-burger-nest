"use client";

import { useEffect, useId, useRef, useState } from "react";
import { copy } from "@/data/copy";
import type { Lang } from "@/data/menu";
import { site } from "@/data/site";
import {
  cartCents,
  describeLine,
  formatMoney,
  formatSlot,
  findItem,
  lineCents,
  orderMessage,
  pickupSlots,
  whatsappHref,
  type CartLine,
} from "@/lib/order";
import { SquarePay, type SquareConfig } from "@/components/square-pay";

function digits(value: string) {
  return value.replace(/\D/g, "");
}

export function OrderSheet({
  open,
  lang,
  lines,
  square,
  onClose,
  onChange,
  onEdit,
  onBrowse,
}: {
  open: boolean;
  lang: Lang;
  lines: CartLine[];
  square: SquareConfig;
  onClose: () => void;
  onChange: (lines: CartLine[]) => void;
  onEdit: (lineId: string) => void;
  onBrowse: () => void;
}) {
  const text = copy[lang];
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [when, setWhen] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<{ message: string; paid: boolean; code: string } | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSlots(pickupSlots());
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const total = cartCents(lines);
  const doorDashHref = site.doorDashOnlineOrderingUrl || site.doorDashUrl;

  function formError() {
    if (name.trim().length < 2) return text.invalidName;
    if (digits(phone).length < 10) return text.invalidPhone;
    if (!when) return text.invalidTime;
    if (fulfillment === "delivery" && address.trim().length < 8) return text.invalidAddress;
    return null;
  }

  function buildTicket(paid: boolean) {
    const code = `BN-${Math.floor(1000 + Math.random() * 9000)}`;
    const message = orderMessage({
      lang,
      code,
      fulfillment,
      paid,
      name: name.trim(),
      phone: phone.trim(),
      whenLabel: formatSlot(when, lang),
      address: address.trim(),
      notes,
      lines,
    });
    return { message, paid, code };
  }

  function payAtPickup() {
    const problem = formError();
    setError(problem);
    if (problem || lines.length === 0) return;
    const next = buildTicket(false);
    setTicket(next);
    window.open(whatsappHref(next.message), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <button type="button" className="absolute inset-0 bg-ink/70" aria-label={text.close} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[100svh] w-full flex-col overflow-hidden bg-foam md:max-h-[min(900px,92svh)] md:max-w-lg md:rounded-[28px]"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id={titleId} className="font-display text-3xl">
            {text.yourOrder}
          </h2>
          <button ref={closeRef} type="button" onClick={onClose} className="rounded-full px-3 py-2 text-sm">
            {text.close}
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {ticket ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-nest">
                {text.order} {ticket.code}
              </p>
              <p className="text-base leading-7">{ticket.paid ? text.confirmPaid : text.confirmPickup}</p>
              <pre className="whitespace-pre-wrap rounded-2xl bg-cream p-4 text-sm leading-6">{ticket.message}</pre>
              <a
                href={whatsappHref(ticket.message)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center justify-center rounded-full bg-nest text-sm font-semibold text-cream"
              >
                {text.sendWhatsapp}
              </a>
              <button type="button" onClick={onBrowse} className="h-12 w-full rounded-full border border-line text-sm font-semibold">
                {text.another}
              </button>
            </div>
          ) : lines.length === 0 ? (
            <div className="py-10">
              <p className="font-display text-3xl">{text.emptyTitle}</p>
              <p className="mt-2 text-sm text-ink-soft">{text.emptyBody}</p>
              <button type="button" onClick={onBrowse} className="mt-6 h-12 rounded-full bg-ember px-5 text-sm font-semibold text-cream">
                {text.browse}
              </button>
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {lines.map((line) => {
                  const item = findItem(line.itemId);
                  if (!item) return null;
                  return (
                    <li key={line.id} className="rounded-2xl border border-line bg-white p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">
                            {line.quantity} × {item.name[lang]}
                          </p>
                          <p className="mt-1 text-sm leading-5 text-ink-soft">
                            {describeLine(item, line.selections, lang)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatMoney(lineCents(item, line.selections) * line.quantity, lang)}
                        </p>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button type="button" onClick={() => onEdit(line.id)} className="rounded-full border border-line px-3 py-2 text-xs">
                          {text.edit}
                        </button>
                        <button
                          type="button"
                          onClick={() => onChange(lines.filter((entry) => entry.id !== line.id))}
                          className="rounded-full border border-line px-3 py-2 text-xs"
                        >
                          {text.remove}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="grid grid-cols-2 gap-2" role="group" aria-label={text.pickup}>
                {(["pickup", "delivery"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={fulfillment === mode}
                    onClick={() => setFulfillment(mode)}
                    className={`h-12 rounded-full text-sm font-semibold ${
                      fulfillment === mode ? "bg-ink text-cream" : "border border-line"
                    }`}
                  >
                    {text[mode]}
                  </button>
                ))}
              </div>

              <label className="block text-sm font-semibold">
                {text.name}
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  className="mt-1 h-12 w-full rounded-2xl border border-line bg-white px-3 text-base font-normal"
                />
              </label>
              <label className="block text-sm font-semibold">
                {text.phone}
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  className="mt-1 h-12 w-full rounded-2xl border border-line bg-white px-3 text-base font-normal"
                />
              </label>
              <label className="block text-sm font-semibold">
                {text.time}
                <select
                  value={when}
                  onChange={(event) => setWhen(event.target.value)}
                  className="mt-1 h-12 w-full rounded-2xl border border-line bg-white px-3 text-base font-normal"
                >
                  <option value="">{text.time}</option>
                  {slots.map((slot) => (
                    <option key={slot} value={slot}>
                      {formatSlot(slot, lang)}
                    </option>
                  ))}
                </select>
              </label>
              {slots.length === 0 ? <p className="text-sm text-ember-dark">{text.noSlots}</p> : null}

              {fulfillment === "delivery" ? (
                <>
                  <label className="block text-sm font-semibold">
                    {text.address}
                    <input
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      autoComplete="street-address"
                      placeholder={text.addressHint}
                      className="mt-1 h-12 w-full rounded-2xl border border-line bg-white px-3 text-base font-normal"
                    />
                  </label>
                  <p className="text-sm leading-6 text-ink-soft">{text.deliveryNote}</p>
                  <div className="rounded-2xl bg-cream p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{text.preferApps}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <a
                        href={doorDashHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-11 items-center justify-center rounded-full border border-line bg-white text-sm font-semibold"
                      >
                        {text.doorDash}
                      </a>
                      <a
                        href={site.uberEatsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-11 items-center justify-center rounded-full border border-line bg-white text-sm font-semibold"
                      >
                        {text.uberEats}
                      </a>
                    </div>
                  </div>
                </>
              ) : null}

              <label className="block text-sm font-semibold">
                {text.notes}
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-2xl border border-line bg-white px-3 py-2 text-base font-normal"
                />
              </label>

              {error ? <p className="text-sm text-ember-dark">{error}</p> : null}
            </>
          )}
        </div>

        {ticket || lines.length === 0 ? null : (
          <div className="space-y-3 border-t border-line px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">{text.total}</span>
              <span className="font-display text-3xl">{formatMoney(total, lang)}</span>
            </div>
            {square.enabled ? (
              <>
                <p className="text-xs leading-5 text-ink-soft">{text.cardNote}</p>
                <SquarePay
                  config={square}
                  amountCents={total}
                  disabled={false}
                  label={text.payCard}
                  chargingLabel={text.charging}
                  onSource={async (sourceId, idempotencyKey) => {
                    const problem = formError();
                    if (problem) {
                      setError(problem);
                      throw new Error(problem);
                    }
                    const next = buildTicket(true);
                    const response = await fetch("/api/pay", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({
                        sourceId,
                        idempotencyKey,
                        lines,
                        orderCode: next.code,
                      }),
                    });
                    const payload = (await response.json()) as { error?: string };
                    if (!response.ok) throw new Error(payload.error || text.payFailed);
                    setTicket(next);
                  }}
                />
              </>
            ) : null}
            <button type="button" onClick={payAtPickup} className="h-12 w-full rounded-full bg-ember text-sm font-semibold text-cream">
              {text.payPickup}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
