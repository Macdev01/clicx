package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"go-backend/database"
	"go-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func TestModelProfileHandlers(t *testing.T) {
	r := SetupRouter(t)

	// create user
	user := createUser(t, r)

	// create model profile
	body, _ := json.Marshal(gin.H{"user_id": user.ID.String(), "name": "Model", "bio": "bio"})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/models", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("create model expected 201, got %d", w.Code)
	}
	var model models.ModelProfile
	json.Unmarshal(w.Body.Bytes(), &model)

	// Assert ID is present and valid UUID in DB
	var dbModel models.ModelProfile
	if err := database.DB.First(&dbModel, "id = ?", model.ID).Error; err != nil {
		t.Fatalf("failed to fetch model profile from DB: %v", err)
	}
	if dbModel.ID == uuid.Nil {
		t.Fatalf("expected id to be set, got nil")
	}
	if _, err := uuid.Parse(dbModel.ID.String()); err != nil {
		t.Fatalf("expected valid UUID, got %v", dbModel.ID)
	}

	// list models
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodGet, "/models", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("list models expected 200, got %d", w.Code)
	}
}
