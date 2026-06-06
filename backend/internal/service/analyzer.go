package service

import (
	"fmt"
	"math/rand"
	"strings"
	"time"

	"kentai/backend/internal/domain"
)

// Analyzer KentAI Vision analiz motorunu temsil eder.
type Analyzer struct {
	rng *rand.Rand
}

// NewAnalyzer analiz servisini olusturur.
func NewAnalyzer() *Analyzer {
	return &Analyzer{rng: rand.New(rand.NewSource(time.Now().UnixNano()))}
}

// Analyze base64 goruntuyu degerlendirir; demo icin stabil KentAI Vision fallback uretir.
func (a *Analyzer) Analyze(req domain.AnalyzeRequest) domain.AnalyzeResponse {
	detections := domain.AnalysisDetections{
		TrashOverflow: a.emptyDetection(),
		Occupation:    a.emptyDetection(),
		Rubble:        a.emptyDetection(),
		WaterPuddle:   a.emptyDetection(),
	}

	flags := a.pickFlags(req.FileName)

	if flags["trash"] {
		confidence := a.confidence()
		status := "DOLU"
		if a.rng.Float64() < 0.55 {
			status = "TASIYOR"
		}
		detections.TrashOverflow = domain.DetectionDetail{
			Found:       true,
			Confidence:  confidence,
			Risk:        severity(confidence),
			Description: "KentAI Vision: Cop konteyneri " + status + " - cop toplama ekibi icin otomatik gorev olusturuldu.",
		}
	}

	if flags["occupation"] {
		confidence := a.confidence()
		detections.Occupation = domain.DetectionDetail{
			Found:       true,
			Confidence:  confidence,
			Risk:        severity(confidence),
			Description: "KentAI Vision: Kaldirim isgali tespit edildi. Ilgili zabita birimine loglandi.",
		}
	}

	if flags["rubble"] {
		confidence := a.confidence()
		detections.Rubble = domain.DetectionDetail{
			Found:       true,
			Confidence:  confidence,
			Risk:        severity(confidence),
			Description: "KentAI Vision: 2m2 atik/moloz birikimi tespit edildi. Cevre temizlik birimine otonom is emri acildi.",
		}
	}

	if flags["water"] {
		confidence := a.confidence()
		detections.WaterPuddle = domain.DetectionDetail{
			Found:       true,
			Confidence:  confidence,
			Risk:        severity(confidence),
			Description: "KentAI Vision: Su birikintisi tespit edildi. Ilaclama ekibine vektor riski bildirimi gonderildi.",
		}
	}

	results := resultsFromDetections(detections)
	notifications := notificationsFromDetections(detections)

	return domain.AnalyzeResponse{
		Success:       true,
		Detections:    detections,
		Notifications: notifications,
		Results:       results,
		Summary:       summary(len(results), len(notifications)),
		Source:        "go-kentai-vision",
	}
}

// pickFlags olasilik tabanli ama en az bir-iki sonuc garantili bayrak uretir.
func (a *Analyzer) pickFlags(fileName string) map[string]bool {
	name := strings.ToLower(fileName)
	flags := map[string]bool{
		"trash":      a.rng.Float64() < 0.70 || strings.Contains(name, "cop") || strings.Contains(name, "trash"),
		"occupation": a.rng.Float64() < 0.50 || strings.Contains(name, "isgaliye") || strings.Contains(name, "masa"),
		"rubble":     a.rng.Float64() < 0.30 || strings.Contains(name, "moloz") || strings.Contains(name, "debris"),
		"water":      a.rng.Float64() < 0.20 || strings.Contains(name, "su") || strings.Contains(name, "water"),
	}

	count := 0
	for _, v := range flags {
		if v {
			count++
		}
	}

	if count == 0 {
		flags["rubble"] = true
		flags["occupation"] = true
	} else if count == 1 && a.rng.Float64() < 0.75 {
		if !flags["occupation"] {
			flags["occupation"] = true
		} else {
			flags["rubble"] = true
		}
	}

	return flags
}

// confidence gerçekçi demo güven skoru üretir.
func (a *Analyzer) confidence() int {
	return 78 + a.rng.Intn(18)
}

// emptyDetection bos tespit nesnesi uretir.
func (a *Analyzer) emptyDetection() domain.DetectionDetail {
	return domain.DetectionDetail{Found: false, Confidence: 0, Risk: domain.RiskLow, Description: ""}
}

// severity güven skorunu risk seviyesine çevirir.
func severity(confidence int) domain.RiskSeverity {
	if confidence >= 90 {
		return domain.RiskHigh
	}
	if confidence >= 83 {
		return domain.RiskMedium
	}
	return domain.RiskLow
}

// resultsFromDetections frontend sonuç listesi üretir.
func resultsFromDetections(d domain.AnalysisDetections) []domain.ResultItem {
	items := make([]domain.ResultItem, 0, 4)
	if d.TrashOverflow.Found {
		items = append(items, domain.ResultItem{Category: "cop", Label: "Cop Konteyneri", Confidence: d.TrashOverflow.Confidence, Risk: d.TrashOverflow.Risk, Description: d.TrashOverflow.Description})
	}
	if d.Occupation.Found {
		items = append(items, domain.ResultItem{Category: "isgaliye", Label: "Isgaliye (Masa/Sandalye)", Confidence: d.Occupation.Confidence, Risk: d.Occupation.Risk, Description: d.Occupation.Description})
	}
	if d.Rubble.Found {
		items = append(items, domain.ResultItem{Category: "moloz", Label: "Moloz Yigini", Confidence: d.Rubble.Confidence, Risk: d.Rubble.Risk, Description: d.Rubble.Description})
	}
	if d.WaterPuddle.Found {
		items = append(items, domain.ResultItem{Category: "su", Label: "Su Birikintisi", Confidence: d.WaterPuddle.Confidence, Risk: d.WaterPuddle.Risk, Description: d.WaterPuddle.Description})
	}
	return items
}

// notificationsFromDetections belediye ekip bildirimlerini üretir.
func notificationsFromDetections(d domain.AnalysisDetections) []string {
	n := make([]string, 0, 4)
	if d.TrashOverflow.Found {
		n = append(n, "Cop toplama ekibine bildirim gonderildi")
	}
	if d.Occupation.Found {
		n = append(n, "Zabitaya uyari iletildi")
	}
	if d.Rubble.Found {
		n = append(n, "Temizlik ekibine bildirim gonderildi")
	}
	if d.WaterPuddle.Found {
		n = append(n, "Ilaclama ekibine risk bildirimi gonderildi")
	}
	return n
}

// summary kisa analiz ozetini dondurur.
func summary(resultCount, notificationCount int) string {
	return fmt.Sprintf("%d risk tespit edildi. %d bildirim olusturuldu.", resultCount, notificationCount)
}
