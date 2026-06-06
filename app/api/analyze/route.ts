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
  "KentAI Vision: Kaldırımda durgun su birikintisi tespit edildi, vektör riski mevcut.",
  "KentAI Vision: Yağmur sonrası oluşan su birikintisi görülüyor.",
  "KentAI Vision: Drenaj sorunu kaynaklı su birikintisi alanı tespit edildi.",
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

// Olasılık tabanlı tespit bayrakları üretir
function olasilikTespitleriUret(): {
  cop: boolean;
  isgaliye: boolean;
  moloz: boolean;
  su: boolean;
} {
  return {
    cop: Math.random() < 0.7,
    isgaliye: Math.random() < 0.5,
    moloz: Math.random() < 0.3,
    su: Math.random() < 0.2,
  };
}

// En az 1–2 tespit çıkmasını garanti eder
function minTespitGarantisi(bayraklar: {
  cop: boolean;
  isgaliye: boolean;
  moloz: boolean;
  su: boolean;
}): typeof bayraklar {
  const say = () =>
    [bayraklar.cop, bayraklar.isgaliye, bayraklar.moloz, bayraklar.su].filter(
      Boolean
    ).length;

  if (say() === 0) {
    bayraklar.cop = true;
    if (Math.random() < 0.65) bayraklar.isgaliye = true;
    return bayraklar;
  }

  if (say() === 1 && Math.random() < 0.75) {
    if (!bayraklar.cop) bayraklar.cop = true;
    else if (!bayraklar.isgaliye) bayraklar.isgaliye = true;
    else if (!bayraklar.moloz) bayraklar.moloz = true;
    else bayraklar.su = true;
  }

  return bayraklar;
}

// KentAI Vision akıllı mock analiz motoru
function kentaiVisionAnaliz(): AnalizSonucu {
  const bayraklar = minTespitGarantisi(olasilikTespitleriUret());

  const copGuven = guvenSkoruUret();
  const copTasan = Math.random() < 0.55;

  const isgaliyeGuven = guvenSkoruUret();
  const molozGuven = guvenSkoruUret();
  const suGuven = guvenSkoruUret();

  return {
    copKonteyneriTasmis: bayraklar.cop
      ? {
          var: true,
          guven: copGuven,
          risk: riskSeviyesiBelirle(copGuven),
          aciklama: copTasan
            ? "KentAI Vision: Çöp konteyneri TAŞIYOR — kapasite aşıldı, çevreye atık saçılmış."
            : "KentAI Vision: Çöp konteyneri DOLU — acil boşaltım gerekli.",
        }
      : bosTespit(),
    isgaliye: bayraklar.isgaliye
      ? {
          var: true,
          guven: isgaliyeGuven,
          risk: riskSeviyesiBelirle(isgaliyeGuven),
          aciklama: rastgeleSec(ISGALIYE_ACIKLAMALAR),
        }
      : bosTespit(),
    moloz: bayraklar.moloz
      ? {
          var: true,
          guven: molozGuven,
          risk: riskSeviyesiBelirle(molozGuven),
          aciklama: rastgeleSec(MOLOZ_ACIKLAMALAR),
        }
      : bosTespit(),
    suBirikintisi: bayraklar.su
      ? {
          var: true,
          guven: suGuven,
          risk: riskSeviyesiBelirle(suGuven),
          aciklama: rastgeleSec(SU_ACIKLAMALAR),
        }
      : bosTespit(),
  };
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

// Analiz süresini gerçekçi göstermek için bekletir
function beklet(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// POST /api/analyze — KentAI Vision mock analiz
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body as { image?: string };

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

    const tespitler = kentaiVisionAnaliz();
    const bildirimler = bildirimOlustur(tespitler);
    const sonuclar = sonuclariDonustur(tespitler);

    const tespitSayisi = sonuclar.length;
    const ozet = `${tespitSayisi} risk tespit edildi. ${bildirimler.length} bildirim oluşturuldu.`;

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
