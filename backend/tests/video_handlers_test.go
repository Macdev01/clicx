package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestVideoHandlers(t *testing.T) {
	r := SetupRouter(t)

	// upload without file
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/videos/upload", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("upload expected 400, got %d", w.Code)
	}

	// get media not found
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodGet, "/videos/123", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusNotFound {
		t.Fatalf("get media expected 404, got %d", w.Code)
	}

	// stream not found
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodGet, "/videos/123/stream", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusNotFound {
		t.Fatalf("stream expected 404, got %d", w.Code)
	}
}
