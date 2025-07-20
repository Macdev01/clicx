package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"go-backend/database"
	"go-backend/models"
)

func TestPurchaseHandlers(t *testing.T) {
	r := SetupRouter(t)
	var user models.User
	if err := database.DB.First(&user, 1).Error; err != nil {
		t.Fatalf("failed to load admin user: %v", err)
	}
	user.Balance = 10
	// update user to set balance
	body, _ := json.Marshal(user)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/users/"+jsonID(user.ID), bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("update user expected 200, got %d", w.Code)
	}
	model := createModel(t, r, user.ID)
	post := models.Post{Text: "p", UserID: user.ID, ModelID: model.ID, PublishedAt: time.Now(), IsPremium: true, Price: 5}
	body, _ = json.Marshal(post)
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodPost, "/posts", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("create post expected 201, got %d", w.Code)
	}
	json.Unmarshal(w.Body.Bytes(), &post)

	// buy content
	buy := map[string]interface{}{"user_id": user.ID, "post_id": post.ID.String()}
	body, _ = json.Marshal(buy)
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodPost, "/purchases", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("buy content expected 200, got %d", w.Code)
	}

	// list purchases
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodGet, "/purchases", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("get purchases expected 200, got %d", w.Code)
	}
}
