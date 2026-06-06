package domain

// RiskSeverity belediye operasyon risk seviyesini temsil eder.
type RiskSeverity string

const (
	RiskLow    RiskSeverity = "d\u00fc\u015f\u00fck"
	RiskMedium RiskSeverity = "orta"
	RiskHigh   RiskSeverity = "y\u00fcksek"
)

// DetectionDetail tek bir risk sinifi icin tespit sonucudur.
type DetectionDetail struct {
	Found       bool         `json:"var"`
	Confidence  int          `json:"guven"`
	Risk        RiskSeverity `json:"risk"`
	Description string       `json:"aciklama"`
}

// AnalysisDetections tum desteklenen kentsel riskleri tasir.
type AnalysisDetections struct {
	TrashOverflow DetectionDetail `json:"copKonteyneriTasmis"`
	Occupation    DetectionDetail `json:"isgaliye"`
	Rubble        DetectionDetail `json:"moloz"`
	WaterPuddle   DetectionDetail `json:"suBirikintisi"`
}

// ResultItem frontend panelinde gosterilecek normalize edilmis sonuctur.
type ResultItem struct {
	Category    string       `json:"kategori"`
	Label       string       `json:"etiket"`
	Confidence  int          `json:"guven"`
	Risk        RiskSeverity `json:"risk"`
	Description string       `json:"aciklama"`
}

// AnalyzeRequest goruntu analiz istegidir.
type AnalyzeRequest struct {
	Image    string `json:"image"`
	FileName string `json:"dosyaAdi,omitempty"`
}

// AnalyzeResponse web ve mobil istemcinin ortak analiz yanitidir.
type AnalyzeResponse struct {
	Success       bool               `json:"basarili"`
	Detections    AnalysisDetections `json:"tespitler"`
	Notifications []string           `json:"bildirimler"`
	Results       []ResultItem       `json:"sonuclar"`
	Summary       string             `json:"ozet"`
	Source        string             `json:"kaynak"`
}

// NotificationRequest ekip yonlendirme bildirimi icin kullanilir.
type NotificationRequest struct {
	Type     string `json:"type"`
	Message  string `json:"message"`
	Location string `json:"location,omitempty"`
}
