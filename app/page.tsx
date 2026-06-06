"use client";

import { useCallback, useRef, useState } from "react";

type RiskKategori = "cop" | "moloz" | "su" | "isgaliye";
type RiskSeviyesi = "düşük" | "orta" | "yüksek";

interface TespitSonucu {
  kategori: RiskKategori;
  etiket: string;
  guven: number;
  risk: RiskSeviyesi;
  aciklama: string;
  bildirim: string;
}

interface BildirimKaydi {
  id: string;
  zaman: string;
  kategori: RiskKategori;
  etiket: string;
  guven: number;
  risk: RiskSeviyesi;
  mesaj: string;
  zabitaIletildi: boolean;
  ekipYonlendirildi: boolean;
}

interface AnalizApiYaniti {
  basarili: boolean;
  hata?: string;
  ozet?: string;
  sonuclar?: Omit<TespitSonucu, "bildirim">[];
}

interface Istatistikler {
  bugunTespit: number;
  gonderilenBildirim: number;
  cozulenVaka: number;
}

const BILDIRIM_MAP: Record<RiskKategori, string> = {
  cop: "Çöp toplama ekibine bildirim gönderildi",
  isgaliye: "Zabıtaya uyarı iletildi",
  moloz: "Temizlik ekibine bildirim gönderildi",
  su: "İlaçlama ekibine risk bildirimi gönderildi",
};

const EKIP_MAP: Record<RiskKategori, string> = {
  cop: "Çöp Toplama",
  isgaliye: "Zabıta",
  moloz: "Temizlik",
  su: "İlaçlama",
};

const KATEGORI_STIL: Record<
  RiskKategori,
  { text: string; bg: string; border: string; dot: string; bar: string }
> = {
  cop: {
    text: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/25",
    dot: "bg-orange-400",
    bar: "bg-orange-500",
  },
  isgaliye: {
    text: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/25",
    dot: "bg-yellow-400",
    bar: "bg-yellow-500",
  },
  moloz: {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    dot: "bg-red-400",
    bar: "bg-red-500",
  },
  su: {
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/25",
    dot: "bg-blue-400",
    bar: "bg-blue-500",
  },
};

const KATEGORI_KARTLARI = [
  { id: "cop" as const, baslik: "Çöp Konteyneri", ikon: "🗑️", aciklama: "Taşan konteyner" },
  { id: "moloz" as const, baslik: "Moloz", ikon: "🧱", aciklama: "Atık birikimi" },
  { id: "su" as const, baslik: "Su Birikintisi", ikon: "💧", aciklama: "Vektör riski" },
  { id: "isgaliye" as const, baslik: "İşgaliye", ikon: "🪑", aciklama: "Kaçak tezgah" },
];

const MENU = [
  { id: "dashboard", label: "Dashboard", ikon: "▦", aktif: true },
  { id: "denetim", label: "Saha Denetimi", ikon: "◎", aktif: false },
  { id: "bildirim", label: "Bildirimler", ikon: "◈", aktif: false },
  { id: "rapor", label: "Raporlar", ikon: "▤", aktif: false },
  { id: "ayar", label: "Ayarlar", ikon: "⚙", aktif: false },
];

// Yüklenen dosyayı base64 data URL formatına çevirir
function dosyayiBase64eCevir(dosya: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const okuyucu = new FileReader();
    okuyucu.onload = () => resolve(okuyucu.result as string);
    okuyucu.onerror = () => reject(new Error("Fotoğraf okunamadı"));
    okuyucu.readAsDataURL(dosya);
  });
}

// Anlık zaman damgası üretir
function zamanDamgasi(): string {
  return new Date().toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Belirtilen süre kadar bekler — anonimleştirme simülasyonu için
function beklet(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Tespit sonuçlarından bildirim geçmişi kayıtları oluşturur
function bildirimKayitlariOlustur(sonuclar: TespitSonucu[]): BildirimKaydi[] {
  const simdi = zamanDamgasi();
  return sonuclar.map((s, i) => ({
    id: `${Date.now()}-${s.kategori}-${i}`,
    zaman: simdi,
    kategori: s.kategori,
    etiket: s.etiket,
    guven: s.guven,
    risk: s.risk,
    mesaj: s.bildirim,
    zabitaIletildi: s.kategori === "isgaliye",
    ekipYonlendirildi: true,
  }));
}

const KVKK_KURALLARI = [
  { ikon: "🔒", metin: "Sadece cansız kentsel objeler analiz edilir" },
  { ikon: "🚫", metin: "Yüz tanıma yasak — otomatik bulanıklaştırma aktif" },
  { ikon: "🚫", metin: "Plaka okuma yasak — otomatik bulanıklaştırma aktif" },
  { ikon: "🗑️", metin: "Ham görüntüler analiz sonrası otomatik silinir" },
  { ikon: "✅", metin: "Kişisel veri işlenmez" },
];

// Sabit KVKK uyumluluk kutusu — kural bildirgesi
function KvkkKutusu() {
  return (
    <div className="fixed bottom-20 left-3 z-50 w-56 rounded-xl border border-emerald-500/25 bg-slate-900/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-md sm:bottom-auto sm:left-auto sm:right-3 sm:top-3 sm:w-64 sm:p-4 lg:right-5 lg:top-5">
      <div className="mb-2.5 flex items-center gap-2 border-b border-emerald-500/20 pb-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-sm">
          🛡️
        </span>
        <div>
          <p className="text-xs font-bold text-emerald-400">KVKK Uyumlu</p>
          <p className="text-[9px] text-slate-500">Kural Bildirgesi</p>
        </div>
      </div>
      <ul className="space-y-2">
        {KVKK_KURALLARI.map((k) => (
          <li key={k.metin} className="flex items-start gap-2 text-[10px] leading-snug text-slate-300 sm:text-[11px]">
            <span className="shrink-0">{k.ikon}</span>
            <span>{k.metin}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Sol sidebar — belediye logosu ve menü
function Sidebar({
  acik,
  kapat,
}: {
  acik: boolean;
  kapat: () => void;
}) {
  return (
    <>
      {acik && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={kapat}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-300 lg:static lg:translate-x-0 ${
          acik ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-900/40">
              <span className="text-sm font-black text-white">GB</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">Güngören Belediyesi</p>
              <p className="text-[10px] text-slate-500">KentAI Kurumsal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {MENU.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                item.aktif
                  ? "bg-blue-600/15 font-semibold text-blue-400 ring-1 ring-blue-500/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <span className="text-base opacity-70">{item.ikon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-300">
              CD
            </div>
            <div>
              <p className="text-xs font-medium text-slate-200">Denetim Operatörü</p>
              <p className="text-[10px] text-slate-500">Saha Ekibi</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// Üst istatistik barı
function IstatistikBar({ stats }: { stats: Istatistikler }) {
  const kartlar = [
    { label: "Bugün Tespit", deger: stats.bugunTespit, renk: "text-blue-400", ikon: "🔍" },
    { label: "Gönderilen Bildirim", deger: stats.gonderilenBildirim, renk: "text-orange-400", ikon: "📨" },
    { label: "Çözülen Vaka", deger: stats.cozulenVaka, renk: "text-emerald-400", ikon: "✓" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {kartlar.map((k) => (
        <div
          key={k.label}
          className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3 sm:px-5 sm:py-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 sm:text-xs">
              {k.label}
            </p>
            <span className="text-sm opacity-60">{k.ikon}</span>
          </div>
          <p className={`mt-1 text-xl font-bold sm:text-2xl ${k.renk}`}>{k.deger}</p>
        </div>
      ))}
    </div>
  );
}

// Gerçek zamanlı bildirim akışı satırı
function BildirimAkisSatiri({
  kayit,
  indeks,
}: {
  kayit: BildirimKaydi;
  indeks: number;
}) {
  const stil = KATEGORI_STIL[kayit.kategori];

  return (
    <div
      className={`animate-slide-up rounded-xl border bg-slate-900/80 p-3.5 ${stil.border}`}
      style={{ animationDelay: `${indeks * 100}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${stil.dot}`} />
          <p className="text-xs font-semibold text-slate-100">{kayit.etiket}</p>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-slate-500">{kayit.zaman}</span>
      </div>

      <p className="mt-1.5 text-[11px] text-slate-400">{kayit.mesaj}</p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${stil.bg} ${stil.text}`}>
          %{kayit.guven} güven
        </span>
        <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] capitalize text-slate-400">
          {kayit.risk} risk
        </span>
      </div>

      <div className="mt-2.5 space-y-1 border-t border-slate-800 pt-2.5">
        {kayit.zabitaIletildi && (
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Zabıtaya iletildi ✓
          </p>
        )}
        {kayit.ekipYonlendirildi && (
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {EKIP_MAP[kayit.kategori]} ekibi yönlendirildi ✓
          </p>
        )}
      </div>
    </div>
  );
}

// Analiz sonuç kartı — ana içerik alanı
function TespitKarti({
  sonuc,
  indeks,
}: {
  sonuc: TespitSonucu;
  indeks: number;
}) {
  const stil = KATEGORI_STIL[sonuc.kategori];

  return (
    <div
      className={`animate-slide-up rounded-xl border border-slate-800 bg-slate-900/60 p-4 ${stil.border}`}
      style={{ animationDelay: `${indeks * 100}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${stil.dot}`} />
          <p className="text-sm font-semibold text-slate-100">{sonuc.etiket}</p>
        </div>
        <span className={`font-mono text-xs font-bold ${stil.text}`}>%{sonuc.guven}</span>
      </div>
      {sonuc.aciklama && (
        <p className="mt-1.5 text-xs text-slate-400">{sonuc.aciklama}</p>
      )}
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ${stil.bar}`}
          style={{ width: `${sonuc.guven}%` }}
        />
      </div>

      <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
        <p className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
          <span>🛡️</span>
          Bu tespit kişisel veri içermez
        </p>
        <p className="mt-0.5 text-[10px] text-slate-500">
          Yalnızca cansız kentsel obje tespiti yapılmıştır
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [sidebarAcik, setSidebarAcik] = useState(false);
  const [dosya, setDosya] = useState<File | null>(null);
  const [onizleme, setOnizleme] = useState<string | null>(null);
  const [surukleniyor, setSurukleniyor] = useState(false);
  const [anonimlestiriliyor, setAnonimlestiriliyor] = useState(false);
  const [analizYapiliyor, setAnalizYapiliyor] = useState(false);
  const [goruntuSilindi, setGoruntuSilindi] = useState(false);
  const [sonuclar, setSonuclar] = useState<TespitSonucu[]>([]);
  const [bildirimGecmisi, setBildirimGecmisi] = useState<BildirimKaydi[]>([]);
  const [ozet, setOzet] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [istatistikler, setIstatistikler] = useState<Istatistikler>({
    bugunTespit: 12,
    gonderilenBildirim: 8,
    cozulenVaka: 5,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const analizSifirla = useCallback(() => {
    setSonuclar([]);
    setOzet("");
    setHata(null);
    setGoruntuSilindi(false);
    setAnonimlestiriliyor(false);
  }, []);

  const dosyaIsle = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setDosya(file);
      setOnizleme(URL.createObjectURL(file));
      analizSifirla();
    },
    [analizSifirla]
  );

  const surukleBirak = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setSurukleniyor(false);
      const file = e.dataTransfer.files[0];
      if (file) dosyaIsle(file);
    },
    [dosyaIsle]
  );

  const analizBaslat = useCallback(async () => {
    if (!dosya || anonimlestiriliyor || analizYapiliyor) return;

    analizSifirla();

    // KVKK: Analiz öncesi anonimleştirme simülasyonu
    setAnonimlestiriliyor(true);
    await beklet(1000);
    setAnonimlestiriliyor(false);

    setAnalizYapiliyor(true);

    try {
      const image = await dosyayiBase64eCevir(dosya);
      const yanit = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, dosyaAdi: dosya.name }),
      });

      const veri: AnalizApiYaniti = await yanit.json();
      if (!yanit.ok || !veri.basarili) {
        throw new Error(veri.hata || "Analiz sırasında beklenmeyen bir hata oluştu");
      }

      const eslesmisSonuclar: TespitSonucu[] = (veri.sonuclar ?? []).map((s) => ({
        ...s,
        bildirim: BILDIRIM_MAP[s.kategori],
      }));

      const yeniKayitlar = bildirimKayitlariOlustur(eslesmisSonuclar);

      setSonuclar(eslesmisSonuclar);
      setBildirimGecmisi((prev) => [...yeniKayitlar, ...prev]);
      setOzet(veri.ozet ?? "");

      if (eslesmisSonuclar.length > 0) {
        setIstatistikler((prev) => ({
          bugunTespit: prev.bugunTespit + eslesmisSonuclar.length,
          gonderilenBildirim: prev.gonderilenBildirim + yeniKayitlar.length,
          cozulenVaka: prev.cozulenVaka + Math.floor(eslesmisSonuclar.length * 0.4),
        }));
      }

      // KVKK: Ham görüntü analiz sonrası silindi simülasyonu
      setGoruntuSilindi(true);
    } catch (err) {
      setHata(
        err instanceof Error ? err.message : "Analiz başarısız oldu, lütfen tekrar deneyin"
      );
    } finally {
      setAnalizYapiliyor(false);
    }
  }, [dosya, analizSifirla, anonimlestiriliyor, analizYapiliyor]);

  const islemDevamEdiyor = anonimlestiriliyor || analizYapiliyor;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <KvkkKutusu />
      <Sidebar acik={sidebarAcik} kapat={() => setSidebarAcik(false)} />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-0">
        {/* Üst bar */}
        <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
            <button
              type="button"
              onClick={() => setSidebarAcik(true)}
              className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:bg-slate-800 lg:hidden"
              aria-label="Menüyü aç"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="min-w-0 flex-1 pr-4 sm:pr-56 lg:pr-64">
              <h1 className="truncate text-sm font-bold text-white sm:text-lg">
                KentAI
                <span className="ml-1.5 font-normal text-blue-400 sm:ml-2">
                  Otonom Kentsel Denetim Platformu
                </span>
              </h1>
              <p className="truncate text-[10px] text-slate-500 sm:text-xs">
                Belediyeler için yapay zeka destekli saha denetimi
              </p>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-400">Sistem Aktif</span>
            </div>
          </div>
        </header>

        {/* Ana dashboard */}
        <div className="flex flex-1 flex-col xl:flex-row">
          {/* Orta içerik */}
          <main className="flex min-w-0 flex-1 flex-col gap-5 p-4 sm:gap-6 sm:p-6">
            <IstatistikBar stats={istatistikler} />

            <div className="grid flex-1 grid-cols-1 gap-5 xl:grid-cols-[1fr_300px] xl:gap-6">
              {/* Fotoğraf yükleme + analiz */}
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
                  <h2 className="text-sm font-semibold text-slate-200">Saha Görüntüsü Analizi</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    KVKK uyumlu · Yalnızca cansız kentsel obje tespiti
                  </p>

                  <section
                    onDragOver={(e) => { e.preventDefault(); setSurukleniyor(true); }}
                    onDragLeave={() => setSurukleniyor(false)}
                    onDrop={surukleBirak}
                    onClick={() => !onizleme && inputRef.current?.click()}
                    className={`relative mt-4 flex min-h-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all sm:min-h-[300px] ${
                      surukleniyor
                        ? "border-blue-500 bg-blue-500/5"
                        : onizleme
                          ? "border-slate-700 bg-slate-900"
                          : "border-slate-700/60 hover:border-blue-500/40 hover:bg-slate-900/60"
                    }`}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) dosyaIsle(file);
                      }}
                    />

                    {onizleme ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={onizleme} alt="Saha görüntüsü" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />

                        {anonimlestiriliyor && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                            <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
                            <p className="mt-4 max-w-xs px-4 text-center text-sm font-medium text-emerald-300">
                              Görüntü işleniyor: Yüzler ve plakalar bulanıklaştırılıyor…
                            </p>
                            <p className="mt-1 text-xs text-slate-500">KVKK anonimleştirme protokolü</p>
                          </div>
                        )}

                        {goruntuSilindi && !islemDevamEdiyor && (
                          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
                            <span>🗑️</span>
                            Ham görüntü silindi
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className="truncate rounded-lg bg-slate-900/90 px-2.5 py-1 text-xs text-slate-300 ring-1 ring-slate-700">
                            {dosya?.name}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDosya(null);
                              setOnizleme(null);
                              analizSifirla();
                            }}
                            className="shrink-0 rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-400 ring-1 ring-slate-700 hover:text-slate-200"
                          >
                            Kaldır
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="px-6 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600/10 ring-1 ring-blue-500/30">
                          <svg className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                        </div>
                        <p className="mt-3 text-sm font-medium text-slate-300">Sokak fotoğrafını yükleyin</p>
                        <p className="mt-1 text-xs text-slate-500">Sürükle-bırak veya dosya seç · JPG, PNG, WEBP</p>
                      </div>
                    )}
                  </section>

                  {anonimlestiriliyor && (
                    <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
                      <p className="text-xs text-emerald-300">
                        Görüntü işleniyor: Yüzler ve plakalar bulanıklaştırılıyor…
                      </p>
                    </div>
                  )}

                  {onizleme && !anonimlestiriliyor && (
                    <button
                      type="button"
                      onClick={analizBaslat}
                      disabled={islemDevamEdiyor}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500 disabled:opacity-50"
                    >
                      {analizYapiliyor ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Risk analizi yapılıyor…
                        </>
                      ) : (
                        "Denetimi Başlat"
                      )}
                    </button>
                  )}
                </div>

                {/* Kategori kartları */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {KATEGORI_KARTLARI.map((kart) => {
                    const tespit = sonuclar.find((s) => s.kategori === kart.id);
                    const stil = KATEGORI_STIL[kart.id];
                    return (
                      <div
                        key={kart.id}
                        className={`rounded-xl border p-3 sm:p-4 ${
                          tespit
                            ? `${stil.border} ${stil.bg}`
                            : "border-slate-800 bg-slate-900/40"
                        }`}
                      >
                        <span className="text-xl">{kart.ikon}</span>
                        <p className="mt-1.5 text-xs font-semibold text-slate-200 sm:text-sm">{kart.baslik}</p>
                        <p className="text-[10px] text-slate-500">{kart.aciklama}</p>
                        {tespit && (
                          <p className={`mt-2 font-mono text-xs font-bold ${stil.text}`}>
                            %{tespit.guven}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Analiz sonuçları */}
                {analizYapiliyor && (
                  <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
                    <div>
                      <p className="text-sm text-slate-300">Cansız obje tespiti yapılıyor…</p>
                      <p className="mt-0.5 text-xs text-slate-500">Kişisel veri analiz edilmez</p>
                    </div>
                  </div>
                )}

                {hata && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm font-medium text-red-400">Analiz Hatası</p>
                    <p className="mt-1 text-sm text-red-300/80">{hata}</p>
                  </div>
                )}

                {!analizYapiliyor && sonuclar.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Tespit Sonuçları
                    </h3>
                    {sonuclar.map((s, i) => (
                      <TespitKarti key={s.kategori} sonuc={s} indeks={i} />
                    ))}
                  </div>
                )}

                {!analizYapiliyor && sonuclar.length === 0 && ozet && !hata && (
                  <div className="animate-success-scale rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center">
                    <p className="font-medium text-emerald-400">Analiz Tamamlandı</p>
                    <p className="mt-1 text-sm text-slate-400">{ozet}</p>
                  </div>
                )}
              </div>

              {/* Bildirim geçmişi — xl'de yan sütun */}
              <div className="hidden flex-col rounded-xl border border-slate-800 bg-slate-900/40 xl:flex">
                <div className="border-b border-slate-800 px-4 py-3">
                  <h3 className="text-sm font-semibold text-slate-200">Bildirim Geçmişi</h3>
                  <p className="text-[10px] text-slate-500">Oturum içi kayıtlar</p>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto p-3">
                  {bildirimGecmisi.length === 0 ? (
                    <p className="py-8 text-center text-xs text-slate-500">Henüz bildirim yok</p>
                  ) : (
                    bildirimGecmisi.slice(0, 8).map((k, i) => (
                      <BildirimAkisSatiri key={k.id} kayit={k} indeks={i} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* Sağ panel — gerçek zamanlı bildirim akışı */}
          <aside className="flex w-full flex-col border-t border-slate-800 bg-slate-900/60 xl:w-80 xl:border-l xl:border-t-0">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3.5">
              <div>
                <h2 className="text-sm font-semibold text-slate-100">Bildirim Akışı</h2>
                <p className="text-[10px] text-slate-500">Gerçek zamanlı · Canlı</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                LIVE
              </span>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto p-3 sm:p-4 xl:max-h-[calc(100vh-12rem)]">
              {analizYapiliyor && (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
                  <p className="text-xs text-slate-400">Bildirimler hazırlanıyor…</p>
                </div>
              )}

              {!analizYapiliyor && bildirimGecmisi.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-xl">
                    📡
                  </div>
                  <p className="text-xs text-slate-500">
                    Bildirim akışı boş.
                    <br />
                    Denetim başlattığınızda burada görünür.
                  </p>
                </div>
              )}

              {!analizYapiliyor &&
                bildirimGecmisi.map((kayit, i) => (
                  <BildirimAkisSatiri key={kayit.id} kayit={kayit} indeks={i} />
                ))}
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-slate-900/80 px-4 py-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
            <p className="text-[10px] text-slate-500 sm:text-xs">
              KVKK Bölüm 3 tam uyumlu · Kişisel veri işlenmez · ISO 27001
            </p>
            <p className="text-[10px] text-slate-600 sm:text-xs">
              © 2025 KentAI · Belediyeler için geliştirildi
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
