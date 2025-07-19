package tests

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestPlisioInvoiceBadRequest(t *testing.T) {
	r := SetupRouter(t)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/payments/plisio", bytes.NewBufferString("bad"))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("create invoice expected 400, got %d", w.Code)
	}
}
