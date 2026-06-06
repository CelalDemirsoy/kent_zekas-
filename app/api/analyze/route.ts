import { NextRequest, NextResponse } from "next/server";

type RiskSeviyesi = "düşük" | "orta" | "yüksek";

interface TespitDetay {
  var: boolean;
  guven: number;
  risk: RiskSeviyesi;
  aciklama: string;
}

interface AnalizSonucu {
  copKonteyneriTasmis: TespitDetay;
  isgaliye: TespitDetay;
  moloz: TespitDetay;
  suBirikintisi: TespitDetay;
}

interface AnalizYaniti {
  basarili: boolean;
  tespitler: AnalizSonucu;
  bildirimler: string[];
  sonuclar: {
    kategori: "cop" | "moloz" | "su" | "isgaliye";
    etiket: string;
    guven: number;
    risk: RiskSeviyesi;
    aciklama: string;
  }[];
  ozet: string;
}

// Risk tanımları — temel ihtimal ve dosya adı anahtar kelimeleri
const RISK_TANIMLARI = [
  {
    anahtar: "copKonteyneriTasmis" as const,
    kategori: "cop" as const,
    etiket: "Çöp Konteyneri",
    temelIhtimal: 0.6,
    anahtarKelimeler: ["cop", "çöp", "konteyner", "tasan", "trash"],
    aciklamalar: [
      "Konteyner kapasitesini aşan atık birikimi tespit edildi.",
      "Çöp konteyneri taşmış durumda, çevreye saçılma riski var.",
      "Dolu konteyner ve etrafında birikmiş atıklar görülüyor.",
    ],
  },
  {
    anahtar: "isgaliye" as const,
    kategori: "isgaliye" as const,
    etiket: "İşgaliye (Masa/Sandalye)",
    temelIhtimal: 0.4,
    anahtarKelimeler: ["isgaliye", "masa", "sandalye", "tezgah", "kafe"],
    aciklamalar: [
      "Kaldırımda kaçak masa ve sandalye yerleşimi tespit edildi.",
      "Yaya yolunu daraltan işgaliye unsurları mevcut.",
      "İşyeri tezgahı kaldırım alanını işgal ediyor.",
    ],
  },
  {
    anahtar: "moloz" as const,
    kategori: "moloz" as const,
    etiket: "Moloz Yığını",
    temelIhtimal: 0.3,
    anahtarKelimeler: ["moloz", "atık", "hurda", "yığın", "debris"],
    aciklamalar: [
      "Yol kenarında moloz ve inşaat atığı birikimi görülüyor.",
      "Kaldırım kenarında moloz yığını tespit edildi.",
      "Dağınık moloz ve hurda malzeme birikintisi mevcut.",
    ],
  },
  {
    anahtar: "suBirikintisi" as const,
    kategori: "su" as const,
    etiket: "Su Birikintisi",
    temelIhtimal: 0.2,
    anahtarKelimeler: ["su", "birikinti", "durgun", "su birikintisi", "water"],
    aciklamalar: [
      "Kaldırımda durgun su birikintisi tespit edildi, vektör riski mevcut.",
      "Yağmur sonrası oluşan su birikintisi görülüyor.",
      "Drenaj sorunu kaynaklı su birikintisi alanı tespit edildi.",
    ],
  },
];

// Base64 görüntü verisini doğrular ve ayrıştırır
function base64Ayristir(
  hamVeri: string
): { data: string; mediaType: string } | null {
  const dataUrlEslesme = hamVeri.match(
    /^data:(image\/[a-zA-Z+]+);base64,(.+)$/
  );

  if (dataUrlEslesme) {
    return { mediaType: dataUrlEslesme[1], data: dataUrlEslesme[2] };
  }

  const temiz = hamVeri.replace(/\s/g, "");
  if (!temiz) return null;

  return { mediaType: "image/jpeg", data: temiz };
}

// Metin kaynağından deterministik sayısal tohum üretir
function tohumUret(kaynak: string): number {
  let hash = 0;
  for (let i = 0; i < kaynak.length; i++) {
    hash = (hash << 5) - hash + kaynak.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Tohum ve indekse göre 0-1 arası deterministik rastgele değer üretir
function deterministikRastgele(tohum: number, indeks: number): number {
  const x = Math.sin(tohum + indeks * 9999) * 10000;
  return x - Math.floor(x);
}

// Güven skoruna göre risk seviyesi belirler
function riskSeviyesiBelirle(guven: number): RiskSeviyesi {
  if (guven >= 90) return "yüksek";
  if (guven >= 80) return "orta";
  return "düşük";
}

// Dosya adındaki anahtar kelimelere göre tespit ihtimalini artırır
function ihtimalHesapla(
  temelIhtimal: number,
  anahtarKelimeler: string[],
  dosyaAdi: string
): number {
  const kucukAd = dosyaAdi.toLocaleLowerCase("tr");
  const eslesme = anahtarKelimeler.some((kelime) => kucukAd.includes(kelime));
  return eslesme ? Math.min(temelIhtimal + 0.35, 0.95) : temelIhtimal;
}

// Mock analiz motoru — dosya adı ve görüntü verisine göre tespit üretir
function mockAnalizYap(base64Data: string, dosyaAdi?: string): AnalizSonucu {
  const kaynak = (dosyaAdi ?? "") + base64Data.slice(0, 200);
  const tohum = tohumUret(kaynak);

  const tespitler = {} as AnalizSonucu;

  RISK_TANIMLARI.forEach((risk, indeks) => {
    const ihtimal = ihtimalHesapla(
      risk.temelIhtimal,
      risk.anahtarKelimeler,
      dosyaAdi ?? ""
    );
    const zar = deterministikRastgele(tohum, indeks);
    const tespitEdildi = zar < ihtimal;

    const guvenHam = 0.75 + deterministikRastgele(tohum, indeks + 10) * 0.2;
    const guven = tespitEdildi ? Math.round(guvenHam * 100) : 0;
    const aciklamaIndeksi = Math.floor(
      deterministikRastgele(tohum, indeks + 20) * risk.aciklamalar.length
    );

    tespitler[risk.anahtar] = {
      var: tespitEdildi,
      guven,
      risk: tespitEdildi ? riskSeviyesiBelirle(guven) : "düşük",
      aciklama: tespitEdildi ? risk.aciklamalar[aciklamaIndeksi] : "",
    };
  });

  return tespitler;
}

// Tespit sonuçlarına göre ilgili ekiplere bildirim mesajları üretir
function bildirimOlustur(tespitler: AnalizSonucu): string[] {
  const bildirimler: string[] = [];

  if (tespitler.copKonteyneriTasmis.var) {
    bildirimler.push("Çöp toplama ekibine bildirim gönderildi");
  }
  if (tespitler.isgaliye.var) {
    bildirimler.push("Zabıtaya uyarı iletildi");
  }
  if (tespitler.moloz.var) {
    bildirimler.push("Temizlik ekibine bildirim gönderildi");
  }
  if (tespitler.suBirikintisi.var) {
    bildirimler.push("İlaçlama ekibine risk bildirimi gönderildi");
  }

  return bildirimler;
}

// Analiz sonucunu frontend uyumlu liste formatına dönüştürür
function sonuclariDonustur(tespitler: AnalizSonucu): AnalizYaniti["sonuclar"] {
  const sonuclar: AnalizYaniti["sonuclar"] = [];

  for (const risk of RISK_TANIMLARI) {
    const tespit = tespitler[risk.anahtar];
    if (tespit.var) {
      sonuclar.push({
        kategori: risk.kategori,
        etiket: risk.etiket,
        guven: tespit.guven,
        risk: tespit.risk,
        aciklama: tespit.aciklama,
      });
    }
  }

  return sonuclar;
}

// Gerçek API gibi hissettirmek için belirtilen süre kadar bekletir
function beklet(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// POST /api/analyze — base64 fotoğraf alır, mock analiz yapar, JSON döner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, dosyaAdi } = body as {
      image?: string;
      dosyaAdi?: string;
    };

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { basarili: false, hata: "image alanı (base64) zorunludur" },
        { status: 400 }
      );
    }

    const ayristirilmis = base64Ayristir(image);
    if (!ayristirilmis) {
      return NextResponse.json(
        { basarili: false, hata: "Geçersiz base64 görüntü verisi" },
        { status: 400 }
      );
    }

    // Analiz süresini gerçekçi göstermek için 1.5 saniye bekle
    await beklet(1500);

    const tespitler = mockAnalizYap(ayristirilmis.data, dosyaAdi);
    const bildirimler = bildirimOlustur(tespitler);
    const sonuclar = sonuclariDonustur(tespitler);

    const tespitSayisi = sonuclar.length;
    const ozet =
      tespitSayisi > 0
        ? `${tespitSayisi} risk tespit edildi. ${bildirimler.length} bildirim oluşturuldu.`
        : "Herhangi bir hijyen riski tespit edilmedi.";

    const yanit: AnalizYaniti = {
      basarili: true,
      tespitler,
      bildirimler,
      sonuclar,
      ozet,
    };

    return NextResponse.json(yanit);
  } catch (error) {
    const mesaj =
      error instanceof Error ? error.message : "Bilinmeyen sunucu hatası";

    return NextResponse.json({ basarili: false, hata: mesaj }, { status: 500 });
  }
}
