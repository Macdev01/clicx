package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"go-backend/models"
)

func TestModelProfileHandlers(t *testing.T) {
	r := SetupRouter(t)

	// create user
	user := createUser(t, r)

	// create model profile
	body, _ := json.Marshal(gin.H{"user_id": user.ID, "name": "Model", "bio": "bio"})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/models", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("create model expected 201, got %d", w.Code)
	}
	var model models.ModelProfile
	json.Unmarshal(w.Body.Bytes(), &model)

	// list models
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodGet, "/models", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("list models expected 200, got %d", w.Code)
	}

	// get by id
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodGet, "/models/"+jsonID(model.ID), nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("get model expected 200, got %d", w.Code)
	}

	// delete
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodDelete, "/models/"+jsonID(model.ID), nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("delete model expected 200, got %d", w.Code)
	}
}
