package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestFollowHandlers(t *testing.T) {
	r := SetupRouter(t)
	_ = createUser(t, r)
	u2 := createUser(t, r)

	// follow user
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/follow/"+u2.ID.String(), nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("follow expected 200, got %d", w.Code)
	}

	// unfollow
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodDelete, "/follow/"+u2.ID.String(), nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("unfollow expected 200, got %d", w.Code)
	}

	// followers list
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodGet, "/followers", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("followers expected 200, got %d", w.Code)
	}
}
