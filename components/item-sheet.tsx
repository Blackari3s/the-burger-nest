"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { copy } from "@/data/copy";
import type { Lang, MenuItem } from "@/data/menu";
import {
  activeGroups,
  describeLine,
  formatMoney,
  lineCents,
  lineIssue,
  toggleOption,
  withDefaults,
  type CartLine,
  type Selection,
} from "@/lib/order";

export function ItemSheet({
  item,
  existing,
  lang,
  onClose,
  onSave,
}: {
  item: MenuItem;
  existing?: CartLine;
  lang: Lang;
  onClose: () => void;
  onSave: (line: CartLine) => void;
}) {
  const text = copy[lang];
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [quantity, setQuantity] = useState(existing?.quantity ?? 1);
  const [selections, setSelections] = useState<Selection[]>(() =>
    withDefaults(item, existing?.selections ?? []),
  );

  useEffect(() => {
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
  }, [onClose]);

  const groups = activeGroups(item, selections);
  const issue = lineIssue(item, selections);
  const total = lineCents(item, selections) * quantity;
  const detail = describeLine(item, selections, lang);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
      <button type="button" className="absolute inset-0 bg-ink/70" aria-label={text.close} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[100svh] w-full flex-col overflow-hidden bg-foam shadow-2xl md:max-h-[min(880px,92svh)] md:max-w-xl md:rounded-[28px]"
      >
        <div className="relative h-52 shrink-0 bg-nest md:h-60">
          {item.image ? (
            <Image src={item.image} alt={item.imageAlt[lang]} fill className="object-cover" sizes="560px" />
          ) : (
            <div className="flex h-full items-end p-5">
              <p className="font-display text-4xl text-gold">{formatMoney(item.fromPrice, lang)}</p>
            </div>
          )}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-ink/80 px-3 py-2 text-sm text-cream"
          >
            {text.close}
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <div>
            <h2 id={titleId} className="font-display text-3xl leading-none">
              {item.name[lang]}
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{item.description[lang]}</p>
            {detail ? <p className="mt-2 text-sm text-nest">{detail}</p> : null}
          </div>

          {groups.map((group) => (
            <fieldset key={group.id} className="space-y-2">
              <legend className="text-sm font-semibold">
                {group.name[lang]}
                {group.min > 0 ? <span className="ml-2 font-normal text-ember">*</span> : null}
              </legend>
              {group.hint ? <p className="text-xs leading-5 text-ink-soft">{group.hint[lang]}</p> : null}
              <div className="grid gap-2">
                {group.options.map((option) => {
                  const selected = selections
                    .find((selection) => selection.groupId === group.id)
                    ?.optionIds.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={Boolean(selected)}
                      onClick={() => setSelections((current) => toggleOption(item, current, group.id, option.id))}
                      className={`flex min-h-11 items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm ${
                        selected ? "border-ember bg-white" : "border-line bg-cream"
                      }`}
                    >
                      <span>{option.name[lang]}</span>
                      <span className="text-ink-soft">
                        {option.price > 0 ? `+${formatMoney(option.price, lang)}` : text.included}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="border-t border-line bg-foam px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={text.decrease}
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="h-11 w-11 rounded-full border border-line text-lg"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                aria-label={text.increase}
                onClick={() => setQuantity((value) => Math.min(10, value + 1))}
                className="h-11 w-11 rounded-full border border-line text-lg"
              >
                +
              </button>
            </div>
            <p className="font-display text-2xl">{formatMoney(total, lang)}</p>
          </div>
          <button
            type="button"
            disabled={Boolean(issue)}
            onClick={() =>
              onSave({
                id: existing?.id ?? crypto.randomUUID(),
                itemId: item.id,
                quantity,
                selections,
              })
            }
            className="h-12 w-full rounded-full bg-ember text-sm font-semibold text-cream disabled:opacity-50"
          >
            {issue === "drink" ? text.chooseDrink : issue ? text.chooseRequired : existing ? text.updateItem : text.addToOrder}
          </button>
        </div>
      </div>
    </div>
  );
}
