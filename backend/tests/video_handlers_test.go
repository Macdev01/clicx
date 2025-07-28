package tests

import (
	"bytes"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strconv"
	"testing"
)

func TestVideoHandlers(t *testing.T) {
	r := SetupRouter(t)

	// upload without file
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/videos/upload", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("upload expected 400, got %d", w.Code)
	}

	// --- Positive path: create a user, post, and upload a video ---
	// (Assume helper functions exist or mock as needed)
	userID := 1
	postID := "00000000-0000-0000-0000-000000000001"

	// Create a dummy video file
	videoPath := "testdata/test.mp4"
	os.MkdirAll("testdata", 0755)
	os.WriteFile(videoPath, []byte("dummy video content"), 0644)
	defer os.RemoveAll("testdata")

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	_ = writer.WriteField("post_id", postID)
	fileWriter, _ := writer.CreateFormFile("video", filepath.Base(videoPath))
	file, _ := os.Open(videoPath)
	defer file.Close()
	_, _ = io.Copy(fileWriter, file)
	writer.Close()

	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodPost, "/videos/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("upload expected 200, got %d", w.Code)
	}
	var mediaResp map[string]interface{}
	json.NewDecoder(w.Body).Decode(&mediaResp)
	mediaID := int(mediaResp["id"].(float64))

	// get media by ID
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodGet, "/videos/"+strconv.Itoa(mediaID), nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("get media expected 200, got %d", w.Code)
	}

	// stream video
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodGet, "/videos/"+strconv.Itoa(mediaID)+"/stream", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("stream expected 200, got %d", w.Code)
	}
	var streamResp map[string]interface{}
	json.NewDecoder(w.Body).Decode(&streamResp)
	if _, ok := streamResp["url"]; !ok {
		t.Fatalf("stream response missing url")
	}

	// list media by post
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodGet, "/videos/post/"+postID, nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("list media by post expected 200, got %d", w.Code)
	}

	// list media by user
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodGet, "/videos/user/"+strconv.Itoa(userID), nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("list media by user expected 200, got %d", w.Code)
	}

	// delete video
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodDelete, "/videos/"+strconv.Itoa(mediaID), nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("delete video expected 200, got %d", w.Code)
	}
}
