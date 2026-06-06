"use client";

import { useEffect, useMemo, useState } from "react";

type Slide = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
};

const orange = "text-orange-400";

function MetricCard({
  value,
  label,
  accent = "orange",
}: {
  value: string;
  label: string;
  accent?: "orange" | "blue" | "green";
}) {
  const color =
    accent === "green"
      ? "text-emerald-400"
      : accent === "blue"
        ? "text-blue-400"
        : "text-orange-400";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur">
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{label}</p>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-lg leading-relaxed text-slate-200">
      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-400 shadow-lg shadow-orange-500/40" />
      <span>{children}</span>
    </li>
  );
}

function PriceCard({
  name,
  price,
  desc,
  highlighted,
}: {
  name: string;
  price: string;
  desc: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-6 ${
        highlighted
          ? "border-orange-500/50 bg-orange-500/10 shadow-2xl shadow-orange-500/10"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
        {name}
      </p>
      <p className="mt-4 text-3xl font-black text-white">{price}</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">{desc}</p>
    </div>
  );
}

function MarketBar({
  label,
  value,
  width,
}: {
  label: string;
  value: string;
  width: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-slate-200">{label}</span>
        <span className="font-mono text-orange-400">{value}</span>
      </div>
      <div className="h-5 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400 shadow-lg shadow-orange-500/30"
          style={{ width }}
        />
      </div>
    </div>
  );
}

export default function PitchPage() {
  const [index, setIndex] = useState(0);

  const slides = useMemo<Slide[]>(
    () => [
      {
        eyebrow: "01 / Hook",
        title: "İstanbul'da Her Gün 12.400 Kent İhlali Tespit Edilemiyor",
        subtitle: "KentAI bunu 3 saniyede çözüyor.",
        content: (
          <div className="relative mt-10 overflow-hidden rounded-[2rem] border border-orange-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8">
            <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,#f97316_0,transparent_30%),linear-gradient(135deg,#111827_0%,#020617_50%,#000_100%)]" />
            <div className="relative grid gap-6 md:grid-cols-3">
              <MetricCard value="12.400" label="günlük görünmeyen ihlal" />
              <MetricCard value="3 sn" label="görüntüden aksiyona süre" accent="green" />
              <MetricCard value="0" label="kişisel veri işleme" accent="blue" />
            </div>
          </div>
        ),
      },
      {
        eyebrow: "02 / Problem",
        title: "Belediyeler Körce Yönetiyor",
        content: (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <MetricCard value="1.389" label="belediye, parçalı ve manuel denetim süreçleriyle çalışıyor" />
            <MetricCard value="2.3M TL" label="yıllık ortalama zabıta saha denetim maliyeti" />
            <MetricCard value="%23" label="manuel denetim operasyon verimliliği" accent="blue" />
            <MetricCard value="180M TL" label="kaçak işgaliye kaynaklı yıllık gelir kaybı" />
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 md:col-span-2">
              <p className="text-4xl font-black text-red-400">10x</p>
              <p className="mt-2 text-lg text-slate-200">
                Geç müdahale altyapı ve temizlik maliyetini katlıyor.
              </p>
            </div>
          </div>
        ),
      },
      {
        eyebrow: "03 / Çözüm",
        title: "KentAI: Sokakların Yapay Zeka Gözü",
        content: (
          <div className="mt-12 grid items-center gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
            {[
              ["📷", "Kamera görüntüsü", "Sokak kamerası, mobil ekip veya Street View görüntüsü alınır."],
              ["🤖", "AI 3 sn analiz", "Çöp, işgaliye, moloz ve su birikintisi sınıflandırılır."],
              ["📱", "Ekip yönlendir", "Zabıta, temizlik veya ilaçlama birimine otomatik görev açılır."],
            ].map((step, i) => (
              <div key={step[1]} className="contents">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 text-center transition duration-500 hover:-translate-y-1 hover:border-orange-500/40">
                  <div className="text-6xl">{step[0]}</div>
                  <h3 className="mt-5 text-xl font-black text-white">{step[1]}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{step[2]}</p>
                </div>
                {i < 2 && <div className="hidden text-4xl text-orange-400 md:block">→</div>}
              </div>
            ))}
          </div>
        ),
      },
      {
        eyebrow: "04 / Teknoloji",
        title: "Nasıl Yaptık?",
        content: (
          <ul className="mt-10 space-y-5">
            <Bullet>Cursor IDE ile agentic AI geliştirme ve `.cursorrules` mimarisi</Bullet>
            <Bullet>Hugging Face BLIP vision model prototipi ve KentAI Vision fallback motoru</Bullet>
            <Bullet>Next.js web dashboard + Go backend mimarisi</Bullet>
            <Bullet>KVKK uyumlu: sıfır kişisel veri, yüz/plaka tanıma yok</Bullet>
            <Bullet>Vercel + Render.com cloud altyapı</Bullet>
          </ul>
        ),
      },
      {
        eyebrow: "05 / Ürün Demo",
        title: "Canlı Demo",
        content: (
          <div className="mt-8 grid gap-7 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900 p-4 shadow-2xl shadow-black/40">
              <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-black text-orange-400">KentAI Dashboard</span>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">LIVE</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {["Çöp", "İşgaliye", "Moloz", "Su Birikintisi"].map((item) => (
                    <div key={item} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <p className="font-bold text-white">{item}</p>
                      <p className="mt-1 text-sm text-slate-500">Otomatik tespit + bildirim</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <a
                href="https://kent-zekasi-web.vercel.app"
                className="block rounded-2xl bg-orange-500 px-6 py-4 text-center font-black text-white shadow-lg shadow-orange-500/20"
              >
                kent-zekasi-web.vercel.app
              </a>
              <MetricCard value="4" label="tespit kategorisi" />
              <MetricCard value="Auto" label="ekip bildirim sistemi" accent="green" />
            </div>
          </div>
        ),
      },
      {
        eyebrow: "06 / Pazar Fırsatı",
        title: "694 Milyon TL'lik Pazar",
        content: (
          <div className="mt-10 space-y-7 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <MarketBar label="TAM: 1.389 belediye × 500K" value="694M TL" width="100%" />
            <MarketBar label="SAM: 81 büyükşehir × 2M" value="162M TL" width="55%" />
            <MarketBar label="SOM: İlk yıl 10 belediye" value="5M TL" width="18%" />
          </div>
        ),
      },
      {
        eyebrow: "07 / İş Modeli",
        title: "SaaS + Veri Hizmetleri",
        content: (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <PriceCard name="Starter" price="15.000 TL/ay" desc="İlçe belediyeleri için kamera ve mobil saha analizi." />
            <PriceCard name="Pro" price="45.000 TL/ay" desc="Büyükşehir operasyonları için çoklu ilçe ve canlı bildirim." highlighted />
            <PriceCard name="Enterprise" price="Özel" desc="Bakanlık, bölgesel kurulum ve anonim veri analitik raporları." />
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 md:col-span-3">
              <p className="font-bold text-emerald-400">Ek gelir:</p>
              <p className="mt-2 text-slate-200">Anonim kentsel veri analitik raporu ve akıllı şehir içgörüleri.</p>
            </div>
          </div>
        ),
      },
      {
        eyebrow: "08 / Sürdürülebilirlik",
        title: "Neden Uzun Vadeli?",
        content: (
          <ul className="mt-10 space-y-5">
            <Bullet>Her şehir kendi verisini üretir: network effect oluşur.</Bullet>
            <Bullet>Model zamanla daha akıllı hale gelir ve yerel ihlalleri öğrenir.</Bullet>
            <Bullet>Belediye bütçesinden karşılanır: satın alma motivasyonu nettir.</Bullet>
            <Bullet>AB akıllı şehir fonlarına ve sürdürülebilirlik hibelerine uygundur.</Bullet>
          </ul>
        ),
      },
      {
        eyebrow: "09 / Ölçeklenebilirlik",
        title: "İstanbul'dan Dünyaya",
        content: (
          <div className="mt-10 grid gap-4">
            {[
              ["Yıl 1", "10 Türk belediyesi", "Pilot + ilk gelir"],
              ["Yıl 2", "81 büyükşehir", "Ulusal yayılım"],
              ["Yıl 3", "MENA bölgesi", "Körfez ülkeleri ve yüksek bütçeli akıllı şehirler"],
              ["Yıl 5", "Avrupa", "Uyumlu, KVKK/GDPR odaklı smart city altyapısı"],
            ].map((row) => (
              <div key={row[0]} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:grid-cols-[120px_1fr_1.5fr]">
                <p className="font-mono font-black text-orange-400">{row[0]}</p>
                <p className="font-bold text-white">{row[1]}</p>
                <p className="text-slate-400">{row[2]}</p>
              </div>
            ))}
          </div>
        ),
      },
      {
        eyebrow: "10 / Çağrı",
        title: "Birlikte Şehirleri Akıllandıralım",
        content: (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-orange-500/30 bg-orange-500/10 p-8">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-300">Seed Round</p>
              <p className="mt-4 text-6xl font-black text-white">5M TL</p>
              <p className="mt-4 text-slate-300">Kullanım: Ekip + Satış + Model geliştirme</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
              <ul className="space-y-4">
                <Bullet>Pilot: 3 İstanbul ilçesi hazır</Bullet>
                <Bullet>Canlı ürün: web dashboard + mobil + Go backend</Bullet>
                <Bullet>KVKK uyumlu, demo güvenli, belediye odaklı</Bullet>
              </ul>
              <a
                href="mailto:hello@kentai.ai"
                className="mt-8 inline-flex rounded-xl bg-orange-500 px-7 py-4 font-black text-white shadow-lg shadow-orange-500/20"
              >
                İletişime Geç
              </a>
            </div>
          </div>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " ") {
        setIndex((current) => Math.min(current + 1, slides.length - 1));
      }
      if (event.key === "ArrowLeft") {
        setIndex((current) => Math.max(current - 1, 0));
      }
      if (event.key.toLowerCase() === "p") {
        window.print();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  const slide = slides[index];
  const progress = ((index + 1) / slides.length) * 100;

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white print:bg-white">
      <style>{`
        @media print {
          @page { size: 16in 9in; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .slide-print { min-height: 100vh !important; }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 opacity-70 [background-image:radial-gradient(circle_at_15%_20%,rgba(249,115,22,0.18),transparent_28%),radial-gradient(circle_at_85%_70%,rgba(59,130,246,0.12),transparent_30%)]" />

      <div className="no-print fixed left-0 right-0 top-0 z-30 h-1 bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <section className="slide-print relative flex min-h-screen items-center px-6 py-16 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-10 flex items-center justify-between gap-4">
            <div>
              <p className={`text-sm font-black uppercase tracking-[0.35em] ${orange}`}>{slide.eyebrow}</p>
              <h1 className="mt-5 max-w-6xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="mt-6 text-2xl font-semibold text-slate-300 sm:text-3xl">{slide.subtitle}</p>
              )}
            </div>
            <div className="hidden shrink-0 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-5 py-3 text-right lg:block">
              <p className="text-2xl font-black text-orange-400">KentAI</p>
              <p className="text-xs text-slate-500">Investor Deck</p>
            </div>
          </div>

          <div className="animate-slide-up">{slide.content}</div>
        </div>
      </section>

      <footer className="no-print fixed bottom-5 left-5 right-5 z-30 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-3 text-xs text-slate-400 shadow-2xl shadow-black/30 backdrop-blur">
        <div>
          <span className="font-bold text-white">{index + 1}</span> / {slides.length}
          <span className="ml-3 hidden sm:inline">← → ok tuşları · P ile PDF/yazdır</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIndex((current) => Math.max(current - 1, 0))}
            className="rounded-lg border border-slate-700 px-3 py-2 font-bold text-slate-300 transition hover:border-orange-500/50 hover:text-orange-300"
          >
            Önceki
          </button>
          <button
            type="button"
            onClick={() => setIndex((current) => Math.min(current + 1, slides.length - 1))}
            className="rounded-lg bg-orange-500 px-3 py-2 font-bold text-white transition hover:bg-orange-400"
          >
            Sonraki
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-emerald-500/40 px-3 py-2 font-bold text-emerald-300 transition hover:bg-emerald-500/10"
          >
            PDF
          </button>
        </div>
      </footer>
    </main>
  );
}
