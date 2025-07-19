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

func TestPostHandlers(t *testing.T) {
	r := SetupRouter(t)
	user := createUser(t, r)
	model := createModel(t, r, user.ID)

	// create post
	post := models.Post{Text: "hello", UserID: user.ID, ModelID: model.ID, PublishedAt: time.Now()}
	body, _ := json.Marshal(post)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/posts", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("create post expected 201, got %d", w.Code)
	}
	json.Unmarshal(w.Body.Bytes(), &post)

	// list posts
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodGet, "/posts", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("list posts expected 200, got %d", w.Code)
	}

	// get post by id
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodGet, "/posts/"+post.ID.String(), nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("get post expected 200, got %d", w.Code)
	}

	// delete post
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodDelete, "/posts/"+post.ID.String(), nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("delete post expected 200, got %d", w.Code)
	}
}
