package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestPostHandlers(t *testing.T) {
	r := SetupRouter(t)
	user := createUser(t, r)
	model := createModel(t, r, user.ID)

	// create post
	body, _ := json.Marshal(map[string]interface{}{
		"text":      "hello",
		"isPremium": false,
		"userId":    user.ID,
		"modelId":   model.ID,
	})
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

	// list posts
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodGet, "/posts", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("list posts expected 200, got %d", w.Code)
	}

	// get post by id
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodGet, "/posts/"+postResp.ID, nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("get post expected 200, got %d", w.Code)
	}

	// delete post
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodDelete, "/posts/"+postResp.ID, nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("delete post expected 200, got %d", w.Code)
	}
}
