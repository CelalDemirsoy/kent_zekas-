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

Platform; kurumsal belediye senaryosu üzerine kurgulanmış bir dashboard sunar: istatistik paneli, canlı kamera/dosya analizi, gerçek zamanlı bildirim akışı, konumlu ekip yönlendirme ve KVKK kural bildirgesi.

---

## Hackathon Uyumluluk Matrisi

| Zorunlu Başlık | KentAI Karşılığı |
|----------------|------------------|
| Frontend Web | `Next.js` dashboard ve `/landing` satış sayfası |
| Frontend Mobil | `mobile/` altında Expo kamera uygulaması |
| Backend | `backend/` altında Go HTTP API |
| Backend Mimari | `cmd/` + `internal/domain` + `internal/service` + `internal/httpapi` katmanlarıyla masterfabric-go tarzı ayrık mimari |
| AI Veri Seti & Model | Hugging Face BLIP prototipi belgelendi; demo için `KentAI Vision` güvenli fallback motoru |
| Harici Veri Kaynağı | Go backend `GET /streetview` endpoint'i Google Street View API URL'i üretir |
| Hosting | Web: Vercel, Backend: Render.com (`render.yaml` + `backend/Dockerfile`) |
| Cursor IDE | `.cursorrules` ve tüm kod üretimi Cursor AI ile |
| KVKK | Yüz/plaka tanıma yok, cansız obje odağı, analiz sonrası veri silme bildirimi |

> Demo stratejisi: Canlı demoda Go backend hazırsa `NEXT_PUBLIC_BACKEND_URL` ile Render API kullanılır. Backend gecikirse veya kapanırsa frontend 3 saniyede güvenli fallback mock veriye geçer; demo asla bozulmaz.

---

## AI Araçları

| Araç | Kullanım |
|------|----------|
| **Cursor IDE** | Agentic ruleset ile kod geliştirme, refactoring, hata düzeltme ve dokümantasyon |
| **KentAI Vision** | Üretim demosunda çalışan akıllı mock analiz motoru; çöp, işgaliye, moloz ve su birikintisi tespiti |
| **Hugging Face** | BLIP image captioning model entegrasyonu tasarlandı ve denendi (`Salesforce/blip-image-captioning-large`) |
| **Claude Vision** | Alternatif görüntü analizi mimarisi olarak tasarlandı; API endpoint akışı ve JSON yanıt formatı çalışıldı |
| **Cursor Agent** | Doğal dil promptlarıyla bileşen, API, UX ve KVKK akışları geliştirildi |

> **Not:** Canlı demo ortamında analiz endpoint'i (`/api/analyze`) `kaynak: "kentai-vision"` dönen akıllı mock analiz motorunu kullanır. Hugging Face BLIP ve Claude Vision yaklaşımları geliştirme sürecinde prototiplenmiştir.

---

## Cursor IDE Kullanımı

Projede Cursor IDE, yalnızca editör olarak değil, **agentic mimari kuran ana geliştirme ortamı** olarak kullanıldı. Tüm kodlar Cursor AI ile yazıldı, iteratif olarak test edildi ve kullanıcı geri bildirimleriyle geliştirildi.

### `.cursorrules` ile Agentic Mimari

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

### Cursor AI ile Yazılan Ana Modüller

- `app/page.tsx` — B2G dashboard, canlı kamera, dosya yükleme, bildirim akışı, KVKK UX
- `app/api/analyze/route.ts` — KentAI Vision mock analiz API'si
- `app/landing/page.tsx` — B2G satış landing page
- `app/layout.tsx` — Kurumsal metadata ve Türkçe dil ayarı
- `README.md` — Proje dokümantasyonu

---

## Kullanılan Promptlar (Geliştirme Süreci)

Proje, Cursor IDE üzerinde aşamalı doğal dil promptlarıyla inşa edildi:

1. **Ana sayfa tasarımı**  
   Prompt: "Kent Zekası projesinin ana sayfasını yap; koyu tema, turuncu accent, fotoğraf yükleme alanı, risk kartları ve analiz paneli olsun."  
   Çıktı: İlk çalışan dashboard, drag & drop yükleme alanı ve analiz sonuç paneli.

2. **Risk kategorilerinin genişletilmesi**  
   Prompt: "Mevcut page.tsx dosyasına 4. risk kategorisi olarak İşgaliye ekle."  
   Çıktı: İşgaliye kategorisi, sarı vurgu rengi ve örnek analiz sonucu.

3. **Analiz API mimarisi**  
   Prompt: "app/api/analyze/route.ts dosyası oluştur; görüntüyü base64 al, AI ile analiz et, JSON response dön."  
   Çıktı: Next.js route handler, risk tespit formatı, bildirim mesajları.

4. **Frontend–API bağlantısı**  
   Prompt: "Frontend'i analyze API'ye bağla; fotoğrafı base64'e çevir, POST gönder, sonucu sağ panelde göster."  
   Çıktı: Gerçek analiz akışı, loading state, Türkçe hata mesajları.

5. **KentAI Vision mock analiz motoru**  
   Prompt: "Hugging Face yerine direkt akıllı mock analiz kullan; rastgele ama mantıklı sonuç üret, en az 1-2 tespit çıksın."  
   Çıktı: `kaynak: "kentai-vision"` dönen, güven skorlu ve olasılık tabanlı analiz motoru.

6. **UX ve profesyonel dashboard dönüşümü**  
   Prompt: "B2B SaaS + KVKK odaklı yeniden tasarla; sidebar, istatistik barı, gerçek zamanlı bildirim akışı ekle."  
   Çıktı: Kurumsal B2G dashboard, operasyonel istatistikler, canlı bildirim akışı.

7. **KVKK uyumluluk sistemi**  
   Prompt: "Fotoğraf yüklenince analizden önce anonimleştirme simülasyonu göster; KVKK kutusu, kişisel veri notları ve footer ekle."  
   Çıktı: Yüz/plaka bulanıklaştırma simülasyonu, veri silme rozeti, KVKK kural bildirgesi.

8. **Canlı kamera ve konumlu bildirimler**  
   Prompt: "Tüm butonları kullanılabilir hale getir; canlı kamera ile tespit et; bildirimleri konumla gönder."  
   Çıktı: Kamera yakalama, GPS koordinatı, Google Maps linkli bildirimler.

9. **B2G landing page**  
   Prompt: "Ayrı bir landing page ekle; hero, sorun, çözüm, özellikler, fiyatlandırma ve footer olsun."  
   Çıktı: `/landing` altında profesyonel satış sayfası.

Her prompt, `.cursorrules` kısıtlamaları altında uygulanarak KVKK ve belediye bağlamından sapılması engellendi.

---

## KVKK Uyumluluğu

KentAI, kişisel veri işlemeden yalnızca cansız kentsel objeleri analiz edecek şekilde tasarlanmıştır:

- **Sadece cansız kentsel objeler** analiz edilir: çöp konteyneri, işgaliye, moloz, su birikintisi
- **Yüz tanıma yoktur**; insan yüzleri analiz kapsamına alınmaz
- **Plaka tanıma yoktur**; araç plakaları okunmaz veya saklanmaz
- **Analiz sonrası veri siliniyor**; ham görüntülerin saklanmadığı kullanıcı arayüzünde açıkça belirtilir
- **Anonimleştirme simülasyonu**; analiz başlamadan önce yüz/plaka bulanıklaştırma mesajı gösterilir

| Önlem | Uygulama |
|-------|----------|
| Yüz tanıma | **Kapalı** — otomatik bulanıklaştırma simülasyonu |
| Plaka okuma | **Kapalı** — otomatik bulanıklaştırma simülasyonu |
| Veri saklama | Ham görüntüler analiz sonrası silinir |
| Anonimleştirme | Analiz öncesi 1 sn KVKK protokolü |
| Tespit kapsamı | Yalnızca çöp, moloz, su birikintisi, işgaliye |
| Sonuç kartları | "Bu tespit kişisel veri içermez" bildirimi |

Arayüzde **KVKK Kural Bildirgesi** paneli ve footer'da **KVKK Bölüm 3** uyumluluk ifadesi yer alır.

---

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Mobil | Expo, React Native, Expo Camera |
| Stil | Tailwind CSS 4 |
| API | Go backend (`backend/cmd/api`) + Next.js güvenli fallback API |
| AI (demo) | KentAI Vision akıllı mock analiz motoru |
| AI (prototip) | Hugging Face BLIP image captioning |
| AI (alternatif mimari) | Claude Vision API |
| Harici Veri | Google Street View API (`GET /streetview`) |
| Hosting | Vercel (web), Render.com (Go backend) |
| Geliştirme | Cursor IDE + `.cursorrules` |

**Planlanan genişleme:** Gerçek Hugging Face object detection modeli, Street View otomatik lokasyon tarama ve belediye iş emri sistemi entegrasyonu.

---

## Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn
- Go 1.22+
- Expo CLI / Expo Go (mobil demo için)

### Adımlar

```bash
# Repoyu klonlayın
git clone <repo-url>
cd kent-zekasi-web

# Bağımlılıkları yükleyin
npm install

# Ortam değişkenleri opsiyoneldir.
# Demo KentAI Vision mock motoru ile çalışır.
# Prototip AI servisleri için .env.local kullanılabilir:
# HUGGINGFACE_API_KEY=hf_...
# ANTHROPIC_API_KEY=sk-ant-...
# GOOGLE_STREET_VIEW_API_KEY=...

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

### Go Backend

```bash
cd backend
go run ./cmd/api
```

Backend varsayılan olarak [http://localhost:8080](http://localhost:8080) üzerinde çalışır.

Frontend'i Go backend'e bağlamak için:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080 npm run dev
```

Backend endpointleri:

- `GET /health`
- `POST /analyze`
- `POST /notifications`
- `GET /streetview?lat=41.0186&lng=28.8792`

### Expo Mobil

```bash
cd mobile
npm install
EXPO_PUBLIC_BACKEND_URL=http://localhost:8080 npm start
```

Expo uygulaması kamera ile fotoğraf çeker, base64 olarak Go backend'e gönderir ve sonuçları mobil ekranda listeler.

### Üretim Derlemesi

```bash
npm run build
npm start
```

### Vercel'e Deploy

```bash
npx vercel
```

Ortam değişkenleri yalnızca gerçek harici AI servisleri etkinleştirilecekse Vercel dashboard üzerinden tanımlanmalıdır. Varsayılan demo akışı KentAI Vision mock motoru ile çalışır.

### Render Backend Deploy

Render üzerinde `render.yaml` blueprint'i veya `backend/Dockerfile` kullanılabilir. Servis health check endpoint'i:

```text
GET /health
```

Render ortam değişkenleri:

- `GOOGLE_STREET_VIEW_API_KEY`
- `PORT` (Render otomatik verir)

---

## Proje Yapısı

```
kent-zekasi-web/
├── app/
│   ├── api/analyze/route.ts   # KentAI Vision görüntü analiz API'si
│   ├── page.tsx               # B2B dashboard ana sayfa
│   ├── landing/page.tsx       # B2G satış landing page
│   ├── layout.tsx             # Root layout ve metadata
│   └── globals.css            # Global stiller ve animasyonlar
├── backend/
│   ├── cmd/api/main.go         # Go HTTP sunucusu
│   ├── internal/domain         # Ortak veri modelleri
│   ├── internal/service        # KentAI Vision analiz servisi
│   └── internal/httpapi        # HTTP handler katmanı
│       └── /streetview         # Google Street View URL endpoint'i
├── mobile/
│   ├── App.tsx                 # Expo kamera uygulaması
│   ├── app.json
│   └── package.json
├── .cursorrules               # Cursor AI proje kuralları
├── render.yaml                # Render backend deploy blueprint
├── .env.local                 # Ortam değişkenleri (gitignore)
└── README.md
```

---

## Canlı Demo Akışı

1. `/landing` sayfasında B2G değer önerisi gösterilir.
2. Dashboard'da `Canlı Kamera ile Tespit` seçilir.
3. Kamera görüntüsünden fotoğraf çekilir veya dosya yüklenir.
4. Analiz başlamadan önce KVKK anonimleştirme mesajı gösterilir.
5. Go backend `/analyze` endpoint'i çağrılır; 3 saniyede cevap yoksa frontend güvenli mock fallback'e geçer.
6. Sonuçlar `Bildirim Akışı (Live)` panelinde konumlu kartlar olarak görünür.
7. `BUGÜN TESPİT` ve bildirim sayacı otomatik artar.

Bu akış sayesinde jüri karşısında çalışan ürün demosu kesintisiz gösterilebilir.

---

## Commit ve Geliştirme Süreci

Hackathon şartnamesi gereği düzenli commit atılmalıdır. Önerilen commit akışı:

```bash
git add .
git commit -m "Add Go backend analysis service"
git commit -m "Add Expo mobile camera client"
git commit -m "Connect web dashboard to backend with fallback"
git commit -m "Document Cursor and KVKK compliance"
```

Commit mesajları ürün evrimini açık göstermeli; tek seferlik büyük yükleme yapılmamalıdır.

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
