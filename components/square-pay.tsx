"use client";

import { useEffect, useRef, useState } from "react";

export type SquareConfig = {
  enabled: boolean;
  applicationId: string;
  locationId: string;
  environment: "sandbox" | "production";
};

type TokenResult = { status: string; token?: string; errors?: { message?: string }[] };

type Card = {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<TokenResult>;
  destroy?: () => Promise<void>;
};

type Wallet = {
  attach?: (selector: string) => Promise<void>;
  tokenize: () => Promise<TokenResult>;
  destroy?: () => Promise<void>;
};

type Payments = {
  card: () => Promise<Card>;
  googlePay?: (request: unknown) => Promise<Wallet>;
  applePay?: (request: unknown) => Promise<Wallet>;
  paymentRequest: (request: unknown) => unknown;
};

declare global {
  interface Window {
    Square?: { payments: (applicationId: string, locationId: string) => Payments };
  }
}

function scriptSrc(environment: SquareConfig["environment"]) {
  return environment === "production"
    ? "https://web.squarecdn.com/v1/square.js"
    : "https://sandbox.web.squarecdn.com/v1/square.js";
}

function loadSquare(environment: SquareConfig["environment"]) {
  const src = scriptSrc(environment);
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (existing) {
    return existing.dataset.ready === "true"
      ? Promise.resolve()
      : new Promise<void>((resolve, reject) => {
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener("error", () => reject(new Error("Square failed to load")), { once: true });
        });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.ready = "true";
      resolve();
    };
    script.onerror = () => reject(new Error("Square failed to load"));
    document.head.appendChild(script);
  });
}

export function SquarePay({
  config,
  amountCents,
  disabled,
  label,
  chargingLabel,
  onSource,
}: {
  config: SquareConfig;
  amountCents: number;
  disabled: boolean;
  label: string;
  chargingLabel: string;
  onSource: (sourceId: string, idempotencyKey: string) => Promise<void>;
}) {
  const cardRef = useRef<Card | null>(null);
  const googleRef = useRef<Wallet | null>(null);
  const appleRef = useRef<Wallet | null>(null);
  const [ready, setReady] = useState(false);
  const [appleReady, setAppleReady] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idempotency = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cardHolder: { current: Card | null } = { current: null };
    const wallets: Wallet[] = [];

    async function mount() {
      await loadSquare(config.environment);
      if (cancelled || !window.Square) return;
      const payments = window.Square.payments(config.applicationId, config.locationId);
      const card = await payments.card();
      await card.attach("#sq-card");
      cardHolder.current = card;
      cardRef.current = card;
      if (!cancelled) setReady(true);

      const request = payments.paymentRequest({
        countryCode: "US",
        currencyCode: "USD",
        total: { amount: (amountCents / 100).toFixed(2), label: "The Burger Nest" },
      });

      if (payments.googlePay) {
        try {
          const googlePay = await payments.googlePay(request);
          await googlePay.attach?.("#sq-google");
          googleRef.current = googlePay;
          wallets.push(googlePay);
          if (!cancelled) setGoogleReady(true);
        } catch {
          setGoogleReady(false);
        }
      }

      if (payments.applePay) {
        try {
          const applePay = await payments.applePay(request);
          appleRef.current = applePay;
          wallets.push(applePay);
          if (!cancelled) setAppleReady(true);
        } catch {
          setAppleReady(false);
        }
      }
    }

    mount().catch(() => {
      if (!cancelled) setError("The card field could not load.");
    });

    return () => {
      cancelled = true;
      void cardHolder.current?.destroy?.();
      wallets.forEach((wallet) => void wallet.destroy?.());
      cardRef.current = null;
    };
    // Re-mounting on every total change would wipe a half-typed card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.applicationId, config.environment, config.locationId]);

  async function take(source: () => Promise<TokenResult>) {
    if (disabled || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await source();
      if (result.status !== "OK" || !result.token) {
        throw new Error(result.errors?.[0]?.message || "Check the card and try again.");
      }
      if (!idempotency.current) idempotency.current = crypto.randomUUID();
      await onSource(result.token, idempotency.current);
      idempotency.current = null;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The card was not charged.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div id="sq-card" className="min-h-12 rounded-2xl border border-line bg-white p-3" />
      <div id="sq-google" className={googleReady ? "min-h-11" : "hidden"} />
      {appleReady ? (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => void take(() => appleRef.current!.tokenize())}
          className="h-12 w-full rounded-full bg-ink text-sm font-semibold text-cream disabled:opacity-50"
        >
          Apple Pay
        </button>
      ) : null}
      <button
        type="button"
        disabled={!ready || disabled || busy}
        onClick={() => void take(() => cardRef.current!.tokenize())}
        className="h-12 w-full rounded-full bg-nest text-sm font-semibold text-cream disabled:opacity-50"
      >
        {busy ? chargingLabel : label}
      </button>
      {googleReady ? (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => void take(() => googleRef.current!.tokenize())}
          className="h-12 w-full rounded-full border border-ink text-sm font-semibold disabled:opacity-50"
        >
          Google Pay
        </button>
      ) : null}
      {error ? <p className="text-sm text-ember-dark">{error}</p> : null}
    </div>
  );
}
