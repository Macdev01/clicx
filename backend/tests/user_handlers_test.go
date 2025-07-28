package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
)

func TestUserHandlers(t *testing.T) {
	r := SetupRouter(t)

	// create user
	body, _ := json.Marshal(map[string]interface{}{
		"email":    "test@example.com",
		"nickname": "testuser",
		"password": "password123",
	})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/users", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d", w.Code)
	}
	type UserResp struct {
		ID string `json:"id"`
	}
	var created UserResp
	json.Unmarshal(w.Body.Bytes(), &created)

	// Assert ID is present and valid UUID
	if created.ID == "" || created.ID == uuid.Nil.String() {
		t.Fatalf("expected id to be set, got %v", created.ID)
	}
	if _, err := uuid.Parse(created.ID); err != nil {
		t.Fatalf("expected valid UUID, got %v", created.ID)
	}
}
