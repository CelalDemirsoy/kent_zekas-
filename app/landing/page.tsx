import Link from "next/link";

const SORUNLAR = [
  {
    ikon: "👁️",
    baslik: "Manuel Denetim Pahalı",
    aciklama:
      "Saha ekiplerinin sokak sokak dolaşması yüksek işgücü maliyeti ve düşük kapsama oranı yaratır.",
  },
  {
    ikon: "🪑",
    baslik: "Kaçak İşgaliye Gelir Kaybı",
    aciklama:
      "Kaldırım işgalleri belediye gelirlerini azaltır, yaya güvenliğini tehdit eder ve şikâyetleri artırır.",
  },
  {
    ikon: "⏱️",
    baslik: "Geç Müdahale Maliyet Artışı",
    aciklama:
      "Moloz, çöp ve su birikintilerine geç müdahale temizlik maliyetlerini katlayarak büyütür.",
  },
];

const ADIMLAR = [
  {
    no: "01",
    baslik: "Kamera Görüntüsü Al",
    aciklama: "Mevcut sokak kameraları veya saha ekipleri görüntüyü sisteme aktarır.",
    ikon: "📷",
  },
  {
    no: "02",
    baslik: "AI Analiz Et",
    aciklama: "KentAI Vision motoru görüntüyü 3 saniyede analiz eder, ihlalleri sınıflandırır.",
    ikon: "🧠",
  },
  {
    no: "03",
    baslik: "Ekibi Otomatik Yönlendir",
    aciklama: "Zabıta, temizlik ve ilaçlama ekiplerine anlık bildirim ve görev ataması yapılır.",
    ikon: "📨",
  },
];

const OZELLIKLER = [
  { ikon: "🛡️", baslik: "KVKK %100 Uyumlu", aciklama: "Kişisel veri işlenmez, yüz ve plaka otomatik bulanıklaştırılır." },
  { ikon: "⚡", baslik: "3 Saniyede Analiz", aciklama: "Gerçek zamanlı ihlal tespiti ile anında müdahale imkânı." },
  { ikon: "📋", baslik: "4 İhlal Kategorisi", aciklama: "Çöp, işgaliye, moloz ve su birikintisi otomatik sınıflandırma." },
  { ikon: "🔔", baslik: "Otomatik Bildirim", aciklama: "İlgili belediye birimlerine anlık görev ve uyarı iletimi." },
];

const PLANLAR = [
  {
    ad: "Starter",
    hedef: "İlçe Belediyesi",
    fiyat: "Özel Teklif",
    ozellikler: [
      "Günlük 500 görüntü analizi",
      "4 ihlal kategorisi",
      "E-posta bildirimleri",
      "KVKK uyumlu raporlama",
    ],
    oneCikan: false,
  },
  {
    ad: "Pro",
    hedef: "Büyükşehir Belediyesi",
    fiyat: "Özel Teklif",
    ozellikler: [
      "Sınırsız görüntü analizi",
      "Gerçek zamanlı bildirim akışı",
      "Çoklu ilçe yönetimi",
      "API entegrasyonu",
      "Öncelikli destek",
    ],
    oneCikan: true,
  },
  {
    ad: "Enterprise",
    hedef: "Bakanlık",
    fiyat: "Özel Teklif",
    ozellikler: [
      "Ulusal ölçekli deployment",
      "Özel model eğitimi",
      "On-premise kurulum seçeneği",
      "SLA garantisi",
      "Dedicated account manager",
    ],
    oneCikan: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Navigasyon */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-black text-orange-400">KentAI</span>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hidden text-sm text-zinc-400 transition hover:text-zinc-200 sm:block"
            >
              Platforma Git
            </Link>
            <Link
              href="/"
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
            >
              Demo Talep Et
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-orange-600/5 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-orange-400" />
            <span className="text-xs font-medium text-orange-300">B2G · Belediyeler İçin</span>
          </div>

          <h1 className="bg-gradient-to-r from-white via-orange-100 to-orange-400 bg-clip-text text-6xl font-black tracking-tight text-transparent sm:text-8xl">
            KentAI
          </h1>

          <p className="mt-6 text-2xl font-bold text-zinc-100 sm:text-3xl">
            Belediyenizin Dijital Zabıtası
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
            Sokak kameralarından saniyeler içinde ihlal tespiti
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="rounded-xl bg-orange-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400 hover:shadow-orange-500/40"
            >
              Demo Talep Et
            </Link>
            <a
              href="https://kent-zekasi-web.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-zinc-700 px-8 py-4 text-base font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900"
            >
              Canlı Demo İzle
            </a>
          </div>
        </div>
      </section>

      {/* Sorun */}
      <section className="border-t border-zinc-800/80 bg-zinc-900/30 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Sorun</p>
            <h2 className="mt-3 text-2xl font-bold text-zinc-100 sm:text-3xl">
              Belediyeler Her Yıl Milyonlarca Lira Kaybediyor
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-500">
              Geleneksel denetim yöntemleri ölçeklenemiyor, maliyetler kontrol dışına çıkıyor.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {SORUNLAR.map((s) => (
              <div
                key={s.baslik}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition hover:border-orange-500/30 hover:bg-zinc-900"
              >
                <span className="text-3xl">{s.ikon}</span>
                <h3 className="mt-4 text-lg font-semibold text-zinc-100">{s.baslik}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{s.aciklama}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Çözüm */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Çözüm</p>
            <h2 className="mt-3 text-2xl font-bold text-zinc-100 sm:text-3xl">
              KentAI Nasıl Çalışır?
            </h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {ADIMLAR.map((adim, i) => (
              <div key={adim.no} className="relative text-center">
                {i < ADIMLAR.length - 1 && (
                  <div className="absolute left-[calc(50%+2rem)] top-10 hidden h-px w-[calc(100%-4rem)] bg-gradient-to-r from-orange-500/40 to-transparent sm:block" aria-hidden />
                )}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-2xl ring-1 ring-orange-500/30">
                  {adim.ikon}
                </div>
                <p className="mt-4 font-mono text-xs font-bold text-orange-400">{adim.no}</p>
                <h3 className="mt-2 text-lg font-semibold text-zinc-100">{adim.baslik}</h3>
                <p className="mt-2 text-sm text-zinc-500">{adim.aciklama}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Özellikler */}
      <section className="border-t border-zinc-800/80 bg-zinc-900/30 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Özellikler</p>
            <h2 className="mt-3 text-2xl font-bold text-zinc-100 sm:text-3xl">
              Neden KentAI?
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {OZELLIKLER.map((o) => (
              <div
                key={o.baslik}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 text-center"
              >
                <span className="text-3xl">{o.ikon}</span>
                <h3 className="mt-4 text-sm font-bold text-orange-400">{o.baslik}</h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">{o.aciklama}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fiyatlandırma */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Fiyatlandırma</p>
            <h2 className="mt-3 text-2xl font-bold text-zinc-100 sm:text-3xl">
              Belediyenize Uygun Plan
            </h2>
            <p className="mt-3 text-sm text-zinc-500">
              Tüm planlar KVKK uyumlu · Kurumsal SLA · Özel entegrasyon
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PLANLAR.map((plan) => (
              <div
                key={plan.ad}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  plan.oneCikan
                    ? "border-orange-500/50 bg-orange-500/5 shadow-xl shadow-orange-500/10 ring-1 ring-orange-500/30"
                    : "border-zinc-800 bg-zinc-900/40"
                }`}
              >
                {plan.oneCikan && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    En Popüler
                  </span>
                )}
                <p className="text-sm font-semibold text-orange-400">{plan.ad}</p>
                <h3 className="mt-1 text-xl font-bold text-zinc-100">{plan.hedef}</h3>
                <p className="mt-4 text-3xl font-black text-zinc-50">{plan.fiyat}</p>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.ozellikler.map((oz) => (
                    <li key={oz} className="flex items-start gap-2 text-sm text-zinc-400">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {oz}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/"
                  className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition ${
                    plan.oneCikan
                      ? "bg-orange-500 text-white hover:bg-orange-400"
                      : "border border-zinc-700 text-zinc-300 hover:border-orange-500/40 hover:text-orange-300"
                  }`}
                >
                  Demo Talep Et
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800 px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/10 to-zinc-900 p-10 text-center">
          <h2 className="text-2xl font-bold text-zinc-100">
            Belediyenizi Dijitalleştirmeye Hazır mısınız?
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            KentAI ile saha denetim maliyetlerinizi düşürün, müdahale sürenizi kısaltın.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-orange-500 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-400"
          >
            Ücretsiz Demo Başlat
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-900/50 px-6 py-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font-semibold text-orange-400">KentAI</p>
          <p className="mt-2 text-xs text-zinc-500">
            © 2025 KentAI · Türkiye&apos;nin İlk Otonom Kentsel Denetim Platformu
          </p>
          <p className="mt-1 text-[10px] text-zinc-600">
            KVKK Bölüm 3 tam uyumlu · Kişisel veri işlenmez
          </p>
        </div>
      </footer>
    </div>
  );
}
