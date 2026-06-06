# KentAI Mobile (Expo)

Expo mobil istemci, hackathon þartnamesindeki mobil frontend katmanýný karþýlar.

## Özellikler

- Kamera izni alýr
- Fotoðraf çekip base64 formatýnda Go backend'e gönderir
- Backend hata verirse güvenli fallback sonuç gösterir
- KVKK gereði kiþisel veri analizi yapmaz; yalnýzca cansýz kentsel objeler raporlanýr

## Çalýþtýrma

```bash
cd mobile
npm install
EXPO_PUBLIC_BACKEND_URL=http://localhost:8080 npm start
```

Render deployment sonrasý `EXPO_PUBLIC_BACKEND_URL` deðerini Go backend URL'i ile deðiþtirin.
