package services

import (
	"bytes"
	"fmt"
	"net/http"
)

func UploadToBunny(storageZone, storageKey, path string, fileData []byte) error {
	uploadURL := fmt.Sprintf("https://storage.bunnycdn.com/%s/%s", storageZone, path)

	req, err := http.NewRequest("PUT", uploadURL, bytes.NewReader(fileData))
	if err != nil {
		return err
	}

	req.Header.Set("AccessKey", storageKey)
	req.Header.Set("Content-Type", "application/octet-stream")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("upload failed: %s", resp.Status)
	}
	return nil
}
