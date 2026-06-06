package httpapi

import (
	"encoding/json"
	"net/http"
	"net/url"
	"os"
	"time"

	"kentai/backend/internal/domain"
	"kentai/backend/internal/service"
)

// Handler HTTP endpointlerini ve servis bagimliliklarini tutar.
type Handler struct {
	analyzer *service.Analyzer
}

// NewHandler route handler nesnesi olusturur.
func NewHandler(analyzer *service.Analyzer) *Handler {
	return &Handler{analyzer: analyzer}
}

// RegisterRoutes API route kayitlarini yapar.
func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/health", h.withCORS(h.health))
	mux.HandleFunc("/analyze", h.withCORS(h.analyze))
	mux.HandleFunc("/notifications", h.withCORS(h.notifications))
	mux.HandleFunc("/streetview", h.withCORS(h.streetView))
}

// health Render ve frontend icin canlilik kontrolu dondurur.
func (h *Handler) health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"ok":      true,
		"service": "kentai-go-backend",
		"time":    time.Now().Format(time.RFC3339),
	})
}

// analyze base64 goruntu alir ve KentAI Vision analiz sonucunu dondurur.
func (h *Handler) analyze(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	var req domain.AnalyzeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Image == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"basarili": false, "hata": "image alani zorunludur"})
		return
	}

	writeJSON(w, http.StatusOK, h.analyzer.Analyze(req))
}

// notifications ekip yonlendirme log kaydini simule eder.
func (h *Handler) notifications(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	var req domain.NotificationRequest
	_ = json.NewDecoder(r.Body).Decode(&req)
	writeJSON(w, http.StatusOK, map[string]any{
		"ok":       true,
		"status":   "queued",
		"message":  req.Message,
		"location": req.Location,
	})
}

// streetView Google Street View API icin imzalanmamis demo URL'i uretir.
func (h *Handler) streetView(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	apiKey := os.Getenv("GOOGLE_STREET_VIEW_API_KEY")
	if apiKey == "" {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"ok":    false,
			"error": "GOOGLE_STREET_VIEW_API_KEY tanimli degil",
		})
		return
	}

	lat := r.URL.Query().Get("lat")
	lng := r.URL.Query().Get("lng")
	if lat == "" {
		lat = "41.0186"
	}
	if lng == "" {
		lng = "28.8792"
	}

	q := url.Values{}
	q.Set("size", "640x640")
	q.Set("location", lat+","+lng)
	q.Set("fov", "80")
	q.Set("heading", "70")
	q.Set("pitch", "0")
	q.Set("key", apiKey)

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":  true,
		"url": "https://maps.googleapis.com/maps/api/streetview?" + q.Encode(),
	})
}

// withCORS web ve mobil istemciler icin basit CORS headerlarini ekler.
func (h *Handler) withCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		next(w, r)
	}
}

// writeJSON JSON response yazar.
func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
