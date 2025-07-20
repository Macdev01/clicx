package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"go-backend/models"
)

func TestLikeHandler(t *testing.T) {
	r := SetupRouter(t)
	user := createUser(t, r)
	model := createModel(t, r, user.ID)
	post := models.Post{Text: "like", UserID: user.ID, ModelID: model.ID, PublishedAt: time.Now()}
	body, _ := json.Marshal(post)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/posts", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("create post expected 201, got %d", w.Code)
	}
	json.Unmarshal(w.Body.Bytes(), &post)

	// like post
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodPost, "/posts/"+post.ID.String()+"/like", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("like expected 200, got %d", w.Code)
	}
}
