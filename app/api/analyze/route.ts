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
  kaynak: "kentai-vision";
}

const RISK_TANIMLARI = [
  {
    anahtar: "copKonteyneriTasmis" as const,
    kategori: "cop" as const,
    etiket: "Çöp Konteyneri",
  },
  {
    anahtar: "isgaliye" as const,
    kategori: "isgaliye" as const,
    etiket: "İşgaliye (Masa/Sandalye)",
  },
  {
    anahtar: "moloz" as const,
    kategori: "moloz" as const,
    etiket: "Moloz Yığını",
  },
  {
    anahtar: "suBirikintisi" as const,
    kategori: "su" as const,
    etiket: "Su Birikintisi",
  },
];

const ISGALIYE_ACIKLAMALAR = [
  "KentAI Vision: Kaldırımda kaçak masa ve sandalye yerleşimi tespit edildi.",
  "KentAI Vision: Yaya yolunu daraltan işgaliye unsurları mevcut.",
  "KentAI Vision: İşyeri tezgahı kaldırım alanını işgal ediyor.",
];

const MOLOZ_ACIKLAMALAR = [
  "KentAI Vision: Yol kenarında moloz ve inşaat atığı birikimi görülüyor.",
  "KentAI Vision: Kaldırım kenarında moloz yığını tespit edildi.",
  "KentAI Vision: Dağınık moloz ve hurda malzeme birikintisi mevcut.",
];

const SU_ACIKLAMALAR = [
  "KentAI Vision: Kaldırımda durgun su birikintisi tespit edildi, vektör kontrolü gerekli.",
  "KentAI Vision: Yağmur sonrası oluşan su birikintisi görülüyor.",
  "KentAI Vision: Drenaj sorunu kaynaklı su birikintisi alanı tespit edildi.",
];

const DOSYA_ADI_KURALLARI: {
  kategori: "cop" | "isgaliye" | "moloz" | "su";
  kelimeler: string[];
}[] = [
  {
    kategori: "cop",
    kelimeler: ["cop", "çöp", "trash", "garbage", "waste", "bin"],
  },
  {
    kategori: "isgaliye",
    kelimeler: ["isgaliye", "masa", "sandalye", "cafe"],
  },
  {
    kategori: "moloz",
    kelimeler: ["moloz", "insaat", "debris"],
  },
  {
    kategori: "su",
    kelimeler: ["su", "water", "puddle"],
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

// %78–%95 arası gerçekçi güven skoru üretir
function guvenSkoruUret(): number {
  return Math.floor(78 + Math.random() * 18);
}

// Güven skoruna göre risk seviyesi belirler
function riskSeviyesiBelirle(guven: number): RiskSeviyesi {
  if (guven >= 90) return "yüksek";
  if (guven >= 83) return "orta";
  return "düşük";
}

// Tespit edilmemiş risk için boş detay döndürür
function bosTespit(): TespitDetay {
  return { var: false, guven: 0, risk: "düşük", aciklama: "" };
}

// Diziden rastgele bir öğe seçer
function rastgeleSec<T>(dizi: T[]): T {
  return dizi[Math.floor(Math.random() * dizi.length)];
}

// Dosya adından kategori yakalar; eşleşirse yanlış kategori çıkmasını engeller
function dosyaAdindanKategoriBul(
  dosyaAdi?: string
): "cop" | "isgaliye" | "moloz" | "su" | null {
  if (!dosyaAdi) return null;

  const ad = dosyaAdi.toLocaleLowerCase("tr-TR");
  const kural = DOSYA_ADI_KURALLARI.find((k) =>
    k.kelimeler.some((kelime) => ad.includes(kelime))
  );

  return kural?.kategori ?? null;
}

// Eşleşme yoksa her kategoriye skor verip en baskın olanı seçer
function baskinKategoriSec(): "cop" | "isgaliye" | "moloz" | "su" {
  const skorlar = [
    { kategori: "cop" as const, skor: Math.random() * 0.7 },
    { kategori: "isgaliye" as const, skor: Math.random() * 0.5 },
    { kategori: "moloz" as const, skor: Math.random() * 0.3 },
    { kategori: "su" as const, skor: Math.random() * 0.2 },
  ];

  skorlar.sort((a, b) => b.skor - a.skor);
  return skorlar[0].kategori;
}

// Dosya adı eşleştiğinde yalnızca ilgili kategoriyi tespit eder
function tekKategoriAnaliz(kategori: "cop" | "isgaliye" | "moloz" | "su"): AnalizSonucu {
  const copGuven = guvenSkoruUret();
  const isgaliyeGuven = guvenSkoruUret();
  const molozGuven = guvenSkoruUret();
  const suGuven = guvenSkoruUret();

  return {
    copKonteyneriTasmis:
      kategori === "cop"
        ? {
            var: true,
            guven: copGuven,
            risk: riskSeviyesiBelirle(copGuven),
            aciklama:
              Math.random() < 0.55
                ? "KentAI Vision: Dosya adına göre Çöp konteyneri TAŞIYOR olarak tespit edildi."
                : "KentAI Vision: Dosya adına göre Çöp konteyneri DOLU olarak tespit edildi.",
          }
        : bosTespit(),
    isgaliye:
      kategori === "isgaliye"
        ? {
            var: true,
            guven: isgaliyeGuven,
            risk: riskSeviyesiBelirle(isgaliyeGuven),
            aciklama: rastgeleSec(ISGALIYE_ACIKLAMALAR),
          }
        : bosTespit(),
    moloz:
      kategori === "moloz"
        ? {
            var: true,
            guven: molozGuven,
            risk: riskSeviyesiBelirle(molozGuven),
            aciklama: rastgeleSec(MOLOZ_ACIKLAMALAR),
          }
        : bosTespit(),
    suBirikintisi:
      kategori === "su"
        ? {
            var: true,
            guven: suGuven,
            risk: riskSeviyesiBelirle(suGuven),
            aciklama: rastgeleSec(SU_ACIKLAMALAR),
          }
        : bosTespit(),
  };
}

// KentAI Vision akıllı mock analiz motoru
function kentaiVisionAnaliz(dosyaAdi?: string): AnalizSonucu {
  const dosyaKategorisi = dosyaAdindanKategoriBul(dosyaAdi);
  if (dosyaKategorisi) {
    return tekKategoriAnaliz(dosyaKategorisi);
  }

  return tekKategoriAnaliz(baskinKategoriSec());
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
    bildirimler.push("İlaçlama ekibine bildirim gönderildi");
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

// Analiz süresini gerçekçi göstermek için bekletir
function beklet(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// POST /api/analyze — KentAI Vision mock analiz
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, dosyaAdi } = body as { image?: string; dosyaAdi?: string };

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

    await beklet(1500);

    const tespitler = kentaiVisionAnaliz(dosyaAdi);
    const bildirimler = bildirimOlustur(tespitler);
    const sonuclar = sonuclariDonustur(tespitler);

    const tespitSayisi = sonuclar.length;
    const ozet = `${tespitSayisi} tespit oluşturuldu. ${bildirimler.length} bildirim gönderildi.`;

    const yanit: AnalizYaniti = {
      basarili: true,
      tespitler,
      bildirimler,
      sonuclar,
      ozet,
      kaynak: "kentai-vision",
    };

    return NextResponse.json(yanit);
  } catch (error) {
    const mesaj =
      error instanceof Error ? error.message : "Bilinmeyen sunucu hatası";

    return NextResponse.json({ basarili: false, hata: mesaj }, { status: 500 });
  }
}
