package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"go-backend/models"
)

func TestOrderHandlers(t *testing.T) {
	r := SetupRouter(t)

	user := createUser(t, r)
	order := models.Order{UserID: user.ID, Summ: 10}
	body, _ := json.Marshal(order)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/orders", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("create order expected 201, got %d", w.Code)
	}
	json.Unmarshal(w.Body.Bytes(), &order)

	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodGet, "/orders", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("list orders expected 200, got %d", w.Code)
	}
}
