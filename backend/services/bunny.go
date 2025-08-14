package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

var (
	bunnyStorageZone   = os.Getenv("BUNNY_STORAGE_ZONE")
	bunnyStorageAPIKey = os.Getenv("BUNNY_STORAGE_API_KEY")
	bunnyStorageHost   = os.Getenv("BUNNY_STORAGE_HOSTNAME") // e.g. storage.bunnycdn.com
	bunnyPullZoneHost  = os.Getenv("BUNNY_PULL_ZONE_HOSTNAME")

	bunnyStreamAPI    = os.Getenv("BUNNY_STREAM_API") // e.g. https://video.bunnycdn.com
	bunnyStreamAPIKey = os.Getenv("BUNNY_STREAM_API_KEY")
	bunnyStreamLibID  = os.Getenv("BUNNY_STREAM_LIBRARY_ID")
	bunnyStreamHost   = os.Getenv("BUNNY_STREAM_HOST") // e.g. vz-xxx.b-cdn.net
)

// UploadPhotoToBunnyStorage uploads a photo to Bunny Storage and returns the CDN URL.
func UploadPhotoToBunnyStorage(file io.Reader, path string) (string, error) {
	url := fmt.Sprintf("https://%s/%s/%s", bunnyStorageHost, bunnyStorageZone, path)
	req, err := http.NewRequest("PUT", url, file)
	if err != nil {
		return "", err
	}
	req.Header.Set("AccessKey", bunnyStorageAPIKey)
	req.Header.Set("Content-Type", "application/octet-stream")
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return "", fmt.Errorf("bunny storage upload failed: %s", resp.Status)
	}
	cdnURL := fmt.Sprintf("https://%s/%s/%s", bunnyPullZoneHost, bunnyStorageZone, path)
	return cdnURL, nil
}

// UploadVideoToBunnyStream uploads a video to Bunny Stream and returns (bunnyID, playbackURL).
func UploadVideoToBunnyStream(file io.Reader, filename string) (string, string, error) {
	// 1. Create video entry
	createURL := fmt.Sprintf("%s/library/%s/videos", bunnyStreamAPI, bunnyStreamLibID)
	body, _ := json.Marshal(map[string]string{"title": filename})
	req, err := http.NewRequest("POST", createURL, bytes.NewReader(body))
	if err != nil {
		return "", "", err
	}
	req.Header.Set("AccessKey", bunnyStreamAPIKey)
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return "", "", fmt.Errorf("bunny stream create failed: %s", resp.Status)
	}
	var createResp struct {
		Guid string `json:"guid"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&createResp); err != nil {
		return "", "", err
	}
	if createResp.Guid == "" {
		return "", "", fmt.Errorf("bunny stream did not return video guid")
	}

	// 2. Upload video file
	uploadURL := fmt.Sprintf("%s/library/%s/videos/%s", bunnyStreamAPI, bunnyStreamLibID, createResp.Guid)
	uploadReq, err := http.NewRequest("PUT", uploadURL, file)
	if err != nil {
		return "", "", err
	}
	uploadReq.Header.Set("AccessKey", bunnyStreamAPIKey)
	uploadReq.Header.Set("Content-Type", "application/octet-stream")
	uploadClient := &http.Client{Timeout: 0}
	uploadResp, err := uploadClient.Do(uploadReq)
	if err != nil {
		return "", "", err
	}
	defer uploadResp.Body.Close()
	if uploadResp.StatusCode >= 300 {
		return "", "", fmt.Errorf("bunny stream upload failed: %s", uploadResp.Status)
	}

	// 3. Return playback URL
	playbackURL := fmt.Sprintf("https://%s/%s/playback.m3u8", bunnyStreamHost, createResp.Guid)
	return createResp.Guid, playbackURL, nil
}
