package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestLikeHandler(t *testing.T) {
	r := SetupRouter(t)
	user := createUser(t, r)
	model := createModel(t, r, user.ID)
	post := map[string]interface{}{
		"text":      "like",
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

	// like post
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodPost, "/posts/"+postResp.ID+"/like", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("like expected 200, got %d", w.Code)
	}
}
