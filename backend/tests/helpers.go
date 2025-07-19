package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"go-backend/models"
)

func createUser(t *testing.T, r *gin.Engine) models.User {
	t.Helper()
	body, _ := json.Marshal(models.User{Email: fmt.Sprintf("u%v@example.com", time.Now().UnixNano()), Name: "U"})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/users", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("create user expected 201, got %d", w.Code)
	}
	var u models.User
	json.Unmarshal(w.Body.Bytes(), &u)
	return u
}

func createModel(t *testing.T, r *gin.Engine, userID uint) models.ModelProfile {
	t.Helper()
	body, _ := json.Marshal(gin.H{"user_id": userID, "bio": "bio"})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/models", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("create model expected 201, got %d", w.Code)
	}
	var m models.ModelProfile
	json.Unmarshal(w.Body.Bytes(), &m)
	return m
}
