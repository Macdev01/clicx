package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestSavedPostHandlers(t *testing.T) {
	r := SetupRouter(t)
	user, model := createUserWithModel(t, r)
	post := map[string]interface{}{
		"text":      "save",
		"isPremium": false,
		"userId":    user.ID,
		"modelId":   model.ID,
	}
	body, _ := json.Marshal(post)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/posts", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("create post expected 201, got %d", w.Code)
	}
	type PostResp struct {
		ID string `json:"id"`
	}
	var postResp PostResp
	json.Unmarshal(w.Body.Bytes(), &postResp)

	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodPost, "/posts/"+postResp.ID+"/save", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("save expected 200, got %d", w.Code)
	}

	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodGet, "/users/"+user.ID.String()+"/saved-posts", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("saved posts expected 200, got %d", w.Code)
	}
}
