# KentAI Go Backend

Bu servis hackathon þartnamesindeki Go backend katmanýdýr. Yapý `cmd/` + `internal/` ayrýmýyla masterfabric-go tarzý katmanlý mimariye uygun hazýrlanmýþtýr.

## Endpointler

- `GET /health` — canlýlýk kontrolü
- `POST /analyze` — base64 görüntü analizi
- `POST /notifications` — ekip bildirim kuyruðu simülasyonu

## Çalýþtýrma

```bash
cd backend
go run ./cmd/api
```

Varsayýlan port `8080`; Render üzerinde `PORT` env deðiþkeni otomatik kullanýlýr.
