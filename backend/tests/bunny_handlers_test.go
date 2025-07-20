package tests

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestBunnyWebhook(t *testing.T) {
	r := SetupRouter(t)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/webhook/bunny", bytes.NewBufferString("invalid"))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("bunny webhook expected 400, got %d", w.Code)
	}
}
