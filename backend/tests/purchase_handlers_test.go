package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"go-backend/database"
	"go-backend/models"
)

func TestPurchaseHandlers(t *testing.T) {
	r := SetupRouter(t)
	var user models.User
	if err := database.DB.First(&user, 1).Error; err != nil {
		t.Fatalf("failed to load admin user: %v", err)
	}
	// Set balance directly in DB for test setup
	user.Balance = 10
	if err := database.DB.Save(&user).Error; err != nil {
		t.Fatalf("failed to set user balance: %v", err)
	}
	model := createModel(t, r, user.ID)
	postBody, _ := json.Marshal(map[string]interface{}{
		"text":      "p",
		"isPremium": true,
		"userId":    user.ID,
		"modelId":   model.ID,
		"price":     5,
	})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/posts", bytes.NewReader(postBody))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("create post expected 201, got %d", w.Code)
	}
	var postResp struct {
		ID string `json:"id"`
	}
	json.Unmarshal(w.Body.Bytes(), &postResp)

	// buy content
	buyBody, _ := json.Marshal(map[string]interface{}{"user_id": user.ID, "post_id": postResp.ID})
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodPost, "/purchases", bytes.NewReader(buyBody))
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
