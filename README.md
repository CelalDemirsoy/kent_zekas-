# KentAI — Otonom Kentsel Denetim Platformu

**Belediyeler için yapay zeka destekli saha denetimi**

KentAI, belediyelerin sokak ve kaldırım görüntülerinden cansız kentsel riskleri otomatik tespit etmesini sağlayan B2G (Business-to-Government) odaklı bir denetim platformudur. Çöp konteyneri taşması, işgaliye, moloz birikimi ve su birikintisi gibi hijyen riskleri tespit edilir; ilgili belediye ekiplerine anlık bildirim gönderilir.

**Canlı demo:** [kent-zekasi-web.vercel.app](https://kent-zekasi-web.vercel.app)

---

## Proje Amacı

KentAI, İBB ve yerel yönetimler için geliştirilmiş bir **otonom kentsel denetim** çözümüdür. Temel hedefler:

- Saha ekiplerinin manuel denetim yükünü azaltmak
- Hijyen ve düzen risklerini görüntü analiziyle erken tespit etmek
- Temizlik, zabıta, çöp toplama ve ilaçlama ekiplerini otomatik yönlendirmek
- **KVKK uyumlu** şekilde yalnızca cansız kentsel objeleri analiz etmek

Platform; Güngören Belediyesi senaryosu üzerine kurgulanmış kurumsal bir dashboard sunar: istatistik paneli, gerçek zamanlı bildirim akışı ve KVKK kural bildirgesi.

---

## Kullanılan AI Araçları

| Araç | Kullanım |
|------|----------|
| **Cursor IDE** | Tüm proje geliştirme süreci — kod üretimi, refactoring, hata düzeltme |
| **Claude (Anthropic)** | Görüntü analizi için Claude Vision API entegrasyonu tasarlandı ve geliştirildi (`claude-sonnet-4-6`) |
| **Cursor Agent** | Doğal dil promptlarıyla bileşen, API ve UX geliştirme |

> **Not:** Canlı demo ortamında analiz endpoint'i (`/api/analyze`) deterministik **mock analiz** kullanır. Claude Vision entegrasyonu kod tabanında hazırlanmış olup, üretim ortamında API anahtarı ile etkinleştirilebilir.

---

## Cursor Ruleset (`.cursorrules`)

Proje kökündeki `.cursorrules` dosyası, Cursor IDE'nin her oturumda proje bağlamını anlamasını sağlar. Bu dosya sayesinde AI asistanı:

- Projenin **İBB kentsel denetim** bağlamında çalışır
- Teknik stack'i (Next.js, Tailwind, Go backend planı vb.) bilir
- **KVKK kurallarını** her kod üretiminde zorunlu kılar:
  - Sadece cansız kentsel obje tespiti
  - Yüz tanıma ve plaka okuma yasak
  - Otomatik bulanıklaştırma zorunlu
- Geliştirme prensiplerini uygular:
  - Fonksiyonlara Türkçe açıklama yazma
  - Önce çalışan basit versiyon, sonra geliştirme
  - Hata durumunda doğrudan düzeltme
  - README güncelleme

`.cursorrules` dosyası, prompt mühendisliği yerine **kalıcı proje kuralları** tanımlayarak tutarlı ve güvenli kod üretimini garanti eder.

---

## Kullanılan Promptlar (Geliştirme Süreci)

Proje, Cursor IDE üzerinde aşamalı doğal dil promptlarıyla inşa edildi:

1. **Ana sayfa tasarımı** — Koyu tema, turuncu accent, drag & drop fotoğraf yükleme, 4 risk kartı, sağ analiz paneli
2. **İşgaliye kategorisi** — 4. risk tipi (masa/sandalye/tezgah), sarı renk teması
3. **Claude Vision API** — `/api/analyze` endpoint'i, base64 görüntü analizi, bildirim üretimi
4. **Frontend–API bağlantısı** — Analiz butonu, loading state, Türkçe hata mesajları
5. **Mock analiz motoru** — Olasılık tabanlı akıllı tespit, 1.5 sn gecikme simülasyonu
6. **UX iyileştirmesi** — Animasyonlu kartlar, kategori renkleri, konfeti, mobil uyum
7. **B2B SaaS yeniden tasarım** — KentAI markası, sidebar, istatistik barı, bildirim akışı
8. **KVKK uyumluluk sistemi** — Anonimleştirme simülasyonu, kural bildirgesi, kişisel veri notları

Her prompt, `.cursorrules` kısıtlamaları altında uygulanarak KVKK ve belediye bağlamından sapılması engellendi.

---

## KVKK Uyumluluğu

KentAI, kişisel veri işlemeden yalnızca cansız kentsel objeleri analiz edecek şekilde tasarlanmıştır:

| Önlem | Uygulama |
|-------|----------|
| Yüz tanıma | **Kapalı** — otomatik bulanıklaştırma simülasyonu |
| Plaka okuma | **Kapalı** — otomatik bulanıklaştırma simülasyonu |
| Veri saklama | Ham görüntüler analiz sonrası silinir (simülasyon) |
| Anonimleştirme | Analiz öncesi 1 sn KVKK protokolü |
| Tespit kapsamı | Yalnızca çöp, moloz, su birikintisi, işgaliye |
| Sonuç kartları | "Bu tespit kişisel veri içermez" bildirimi |

Arayüzde sabit **KVKK Kural Bildirgesi** kutusu ve footer'da **KVKK Bölüm 3** uyumluluk ifadesi yer alır.

---

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Stil | Tailwind CSS 4 |
| API | Next.js Route Handlers (`app/api/analyze`) |
| AI (planlanan) | Claude Vision API (`claude-sonnet-4-6`) |
| AI (demo) | Deterministik mock analiz motoru |
| Hosting | Vercel |
| Geliştirme | Cursor IDE + `.cursorrules` |

**Planlanan genişleme:** Go backend (masterfabric-go), Hugging Face object detection, Google Street View API

---

## Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn

### Adımlar

```bash
# Repoyu klonlayın
git clone <repo-url>
cd kent-zekasi-web

# Bağımlılıkları yükleyin
npm install

# Ortam değişkenlerini ayarlayın (Claude API için — opsiyonel)
# .env.local dosyası oluşturun:
# ANTHROPIC_API_KEY=sk-ant-...

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

### Üretim Derlemesi

```bash
npm run build
npm start
```

### Vercel'e Deploy

```bash
npx vercel
```

Ortam değişkeni `ANTHROPIC_API_KEY` yalnızca gerçek Claude Vision analizi kullanılacaksa Vercel dashboard üzerinden tanımlanmalıdır.

---

## Proje Yapısı

```
kent-zekasi-web/
├── app/
│   ├── api/analyze/route.ts   # Görüntü analiz API'si (mock / Claude)
│   ├── page.tsx               # B2B dashboard ana sayfa
│   ├── layout.tsx             # Root layout ve metadata
│   └── globals.css            # Global stiller ve animasyonlar
├── .cursorrules               # Cursor AI proje kuralları
├── .env.local                 # Ortam değişkenleri (gitignore)
└── README.md
```

---

## Tespit Edilen Risk Kategorileri

| Kategori | Bildirim |
|----------|----------|
| Çöp Konteyneri | Çöp toplama ekibine bildirim |
| İşgaliye | Zabıtaya uyarı |
| Moloz | Temizlik ekibine bildirim |
| Su Birikintisi | İlaçlama ekibine risk bildirimi |

---

## Lisans ve Telif

© 2025 KentAI · Belediyeler için geliştirildi

KVKK Bölüm 3 tam uyumlu · Kişisel veri işlenmez · ISO 27001 (hedef uyumluluk)
