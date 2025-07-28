package tests

import (
	"bytes"
	"encoding/json"
	"go-backend/database"
	"go-backend/models"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
)

func TestPostHandlers(t *testing.T) {
	r := SetupRouter(t)
	user, model := createUserWithModel(t, r)

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

	// Assert id is present and valid UUID in DB
	var post models.Post
	if err := database.DB.First(&post, "id = ?", postResp.ID).Error; err != nil {
		t.Fatalf("failed to fetch post from DB: %v", err)
	}
	if post.ID == uuid.Nil {
		t.Fatalf("expected id to be set, got nil")
	}
	if _, err := uuid.Parse(post.ID.String()); err != nil {
		t.Fatalf("expected valid UUID, got %v", post.ID)
	}

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
