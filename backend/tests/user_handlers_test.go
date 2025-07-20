package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"go-backend/models"
)

func TestUserHandlers(t *testing.T) {
	r := SetupRouter(t)

	// create user
	body, _ := json.Marshal(models.User{Email: "test@example.com"})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/users", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d", w.Code)
	}
	var created models.User
	json.Unmarshal(w.Body.Bytes(), &created)

	// list users
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodGet, "/users", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("list users: expected 200, got %d", w.Code)
	}

	// get user by id
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodGet, "/users/"+jsonID(created.ID), nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("get user: expected 200, got %d", w.Code)
	}

	// update user
	body, _ = json.Marshal(created)
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodPut, "/users/"+jsonID(created.ID), bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("update user: expected 200, got %d", w.Code)
	}

	// delete user
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodDelete, "/users/"+jsonID(created.ID), nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("delete user: expected 200, got %d", w.Code)
	}
}

func jsonID(id uint) string { return fmt.Sprintf("%d", id) }
