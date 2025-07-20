package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestReferralHandler(t *testing.T) {
	r := SetupRouter(t)
	_ = createUser(t, r)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/referrals", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("referrals expected 200, got %d", w.Code)
	}
}
