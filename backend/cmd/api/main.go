package main

import (
	"log"
	"net/http"
	"os"

	"kentai/backend/internal/httpapi"
	"kentai/backend/internal/service"
)

// main KentAI Go backend HTTP sunucusunu baþlatýr.
func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	analyzer := service.NewAnalyzer()
	handler := httpapi.NewHandler(analyzer)
	mux := http.NewServeMux()
	handler.RegisterRoutes(mux)

	log.Printf("KentAI Go backend listening on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}
