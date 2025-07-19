package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestMigrateHandler(t *testing.T) {
	r := SetupRouter(t)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/migrate", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("migrate expected 200, got %d", w.Code)
	}
}
