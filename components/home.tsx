"use client";

import Image from "next/image";
import { useState } from "react";
import { copy } from "@/data/copy";
import { categories, menu, signatureIds, type Lang } from "@/data/menu";
import { hourLines, site } from "@/data/site";
import { persistLang } from "@/lib/locale";
import { cartCents, formatMoney, type CartLine } from "@/lib/order";
import { ItemSheet } from "@/components/item-sheet";
import { OrderSheet } from "@/components/order-sheet";
import type { SquareConfig } from "@/components/square-pay";

export function Home({ initialLang, square }: { initialLang: Lang; square: SquareConfig }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [editor, setEditor] = useState<{ itemId: string; line?: CartLine } | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const text = copy[lang];
  const total = cartCents(lines);
  const editingItem = editor ? menu.find((item) => item.id === editor.itemId) ?? null : null;
  const signatures = signatureIds
    .map((id) => menu.find((item) => item.id === id))
    .filter((item) => item !== undefined);

  function chooseLang(next: Lang) {
    setLang(next);
    persistLang(next);
  }

  function openOrder() {
    setEditor(null);
    setOrderOpen(true);
  }

  function openItem(itemId: string, line?: CartLine) {
    setOrderOpen(false);
    setEditor({ itemId, line });
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <a href="#top" className="flex min-w-0 items-center gap-2">
            <Image src="/brand/logo.png" alt="" width={40} height={40} className="h-10 w-10 rounded-lg" />
            <span className="truncate font-display text-xl leading-none">{site.name}</span>
          </a>
          <nav className="ml-auto flex items-center gap-2" aria-label={text.language}>
            <a href={`tel:${site.phoneTel}`} className="hidden h-11 items-center rounded-full px-3 text-sm sm:inline-flex">
              {site.phoneDisplay}
            </a>
            <div className="flex rounded-full border border-line p-1">
              {(["en", "es"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={lang === option}
                  onClick={() => chooseLang(option)}
                  className={`h-9 rounded-full px-3 text-xs font-semibold ${lang === option ? "bg-ink text-cream" : ""}`}
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={openOrder}
              className="hidden h-11 items-center rounded-full bg-ember px-4 text-sm font-semibold text-cream md:inline-flex"
            >
              {lines.length > 0 ? `${text.viewOrder} · ${formatMoney(total, lang)}` : text.order}
            </button>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="relative isolate min-h-[calc(100svh-4rem)]">
          <video
            className="absolute inset-0 h-full w-full object-cover object-[72%_center] motion-reduce:hidden"
            autoPlay
            muted
            loop
            playsInline
            poster="/hero/poster.jpg"
            aria-label={
              lang === "es"
                ? "Hamburguesa, bistec de puerco y alitas girando en una mesa"
                : "A hamburger, pork steak, and wings turning on a lazy susan"
            }
          >
            <source src="/hero/lazy-susan.mp4" type="video/mp4" />
          </video>
          <Image
            src="/hero/poster.jpg"
            alt={
              lang === "es"
                ? "Hamburguesa, bistec de puerco y alitas en una mesa"
                : "A hamburger, pork steak, and wings on a lazy susan"
            }
            fill
            priority
            className="hidden object-cover object-[72%_center] motion-reduce:block"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10 md:bg-gradient-to-r md:from-ink md:via-ink/75 md:to-ink/10" />
          <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-end px-5 pb-28 pt-16 text-cream md:justify-center md:px-8 md:pb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{text.eyebrow}</p>
            <h1 className="mt-3 max-w-xl font-display text-5xl leading-[0.95] md:text-7xl">{text.heroTitle}</h1>
            <p className="mt-4 max-w-md text-lg leading-7 text-cream/90">{text.heroLead}</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-cream/75">{text.heroSupport}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={openOrder} className="h-12 rounded-full bg-ember px-5 text-sm font-semibold text-cream">
                {text.order}
              </button>
              <a href="#menu" className="flex h-12 items-center rounded-full border border-cream/40 px-5 text-sm font-semibold">
                {text.seeMenu}
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="signatures-title">
          <h2 id="signatures-title" className="font-display text-3xl">
            {text.signatures}
          </h2>
          <div className="mt-5 flex gap-4 overflow-x-auto pb-2 snap-x md:grid md:grid-cols-4 md:overflow-visible">
            {signatures.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openItem(item.id)}
                className="w-[78%] shrink-0 snap-start text-left md:w-auto"
              >
                <span className="relative block aspect-[4/5] overflow-hidden rounded-[24px] bg-nest">
                  {item.image ? (
                    <Image src={item.image} alt={item.imageAlt[lang]} fill className="object-cover" sizes="(min-width:768px) 25vw, 78vw" />
                  ) : null}
                </span>
                <span className="mt-3 block font-display text-2xl leading-none">{item.name[lang]}</span>
                <span className="mt-1 block text-sm text-ink-soft">
                  {text.from} {formatMoney(item.fromPrice, lang)}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section id="menu" className="scroll-mt-20 mx-auto max-w-6xl px-4 pb-16">
          <div className="sticky top-16 z-30 -mx-4 border-b border-line/80 bg-cream/95 px-4 py-3 backdrop-blur">
            <h2 className="sr-only">{text.menu}</h2>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={`#${category.id}`}
                  className="shrink-0 rounded-full border border-line bg-foam px-3 py-2 text-sm"
                >
                  {category.name[lang]}
                </a>
              ))}
            </div>
          </div>

          {categories.map((category) => (
            <div key={category.id} id={category.id} className="scroll-mt-36 pt-10">
              <h3 className="font-display text-4xl">{category.name[lang]}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">{category.blurb[lang]}</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {menu
                  .filter((item) => item.category === category.id)
                  .map((item) => (
                    <article key={item.id} className="overflow-hidden rounded-[24px] border border-line bg-foam">
                      {item.image ? (
                        <div className="relative aspect-[4/3]">
                          <Image
                            src={item.image}
                            alt={item.imageAlt[lang]}
                            fill
                            className={`object-cover ${item.id === "pork-plate" || item.id === "pork-sandwich" ? "object-[22%_62%]" : "object-center"}`}
                            sizes="(min-width:768px) 50vw, 100vw"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-[2.4/1] items-end bg-nest p-5">
                          <p className="font-display text-4xl text-gold">{formatMoney(item.fromPrice, lang)}</p>
                        </div>
                      )}
                      <div className="flex items-end justify-between gap-3 p-4">
                        <div>
                          <h4 className="font-display text-2xl leading-none">{item.name[lang]}</h4>
                          <p className="mt-2 text-sm leading-6 text-ink-soft">{item.description[lang]}</p>
                          <p className="mt-2 text-sm font-semibold">
                            {text.from} {formatMoney(item.fromPrice, lang)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openItem(item.id)}
                          className="h-11 shrink-0 rounded-full bg-ink px-4 text-sm font-semibold text-cream"
                        >
                          {text.add}
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
            </div>
          ))}
        </section>

        <section id="visit" className="scroll-mt-20 bg-ink text-cream">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 pb-28 pt-14 md:grid-cols-2 md:px-8 md:pb-14">
            <div>
              <h2 className="font-display text-4xl md:text-5xl">{text.visit}</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-cream/80">{text.about}</p>
              <address className="mt-6 not-italic">
                <p className="text-lg">{site.street}</p>
                <p>
                  {site.city}, {site.region} {site.postalCode}
                </p>
                <p className="mt-1 text-sm text-cream/70">{site.neighborhood}</p>
              </address>
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{text.hours}</h3>
                <ul className="mt-3 space-y-1 text-sm">
                  {hourLines.map((line) => (
                    <li key={line.en}>{line[lang]}</li>
                  ))}
                </ul>
                <p className="mt-3 max-w-sm text-sm leading-6 text-cream/70">{text.hoursNote}</p>
              </div>
              <div className="mt-6 rounded-[24px] border border-white/15 p-4">
                <h3 className="font-display text-2xl">{text.cateringTitle}</h3>
                <p className="mt-2 text-sm leading-6 text-cream/80">{text.cateringBody}</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={`tel:${site.phoneTel}`} className="flex h-12 items-center rounded-full bg-ember px-5 text-sm font-semibold">
                  {site.phoneDisplay}
                </a>
                <a
                  href={site.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 items-center rounded-full border border-white/30 px-5 text-sm font-semibold"
                >
                  {text.directions}
                </a>
              </div>
            </div>
            <div className="min-h-80 overflow-hidden rounded-[28px] border border-white/10">
              <iframe title={text.mapTitle} src={site.mapsEmbed} className="h-full min-h-80 w-full border-0" loading="lazy" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-cream">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm md:flex-row md:items-center md:justify-between">
          <p>
            {site.name} · {site.street}, {site.city}
          </p>
          <div className="flex flex-wrap gap-4">
            <a href={site.instagram} target="_blank" rel="noopener noreferrer">
              {text.instagram}
            </a>
            <a href={site.tiktok} target="_blank" rel="noopener noreferrer">
              {text.tiktok}
            </a>
            <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer">
              {text.whatsapp}
            </a>
          </div>
        </div>
        <p className="mx-auto max-w-6xl px-5 pb-24 text-xs text-ink-soft md:pb-8">{text.footer}</p>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <button
          type="button"
          onClick={openOrder}
          className="flex h-12 w-full items-center justify-between rounded-full bg-ember px-5 text-sm font-semibold text-cream"
        >
          <span>{lines.length > 0 ? text.viewOrder : text.order}</span>
          <span>{lines.length > 0 ? formatMoney(total, lang) : text.seeMenu}</span>
        </button>
      </div>

      {editingItem ? (
      <ItemSheet
        key={`${editingItem.id}:${editor?.line?.id ?? "new"}`}
        item={editingItem}
        existing={editor?.line}
        lang={lang}
        onClose={() => setEditor(null)}
        onSave={(line) => {
          setLines((current) => {
            const index = current.findIndex((entry) => entry.id === line.id);
            if (index === -1) return [...current, line];
            return current.map((entry) => (entry.id === line.id ? line : entry));
          });
          setEditor(null);
          if (editor?.line) setOrderOpen(true);
        }}
      />
      ) : null}
      <OrderSheet
        open={orderOpen}
        lang={lang}
        lines={lines}
        square={square}
        onClose={() => setOrderOpen(false)}
        onChange={setLines}
        onEdit={(lineId) => {
          const line = lines.find((entry) => entry.id === lineId);
          if (line) openItem(line.itemId, line);
        }}
        onBrowse={() => {
          setOrderOpen(false);
          document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
        }}
      />
    </>
  );
}
