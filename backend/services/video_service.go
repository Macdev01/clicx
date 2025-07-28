package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"go-backend/config"
	"go-backend/models"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type VideoService struct {
	DB     *gorm.DB
	Logger *zap.Logger
}

func NewVideoService(db *gorm.DB, logger *zap.Logger) *VideoService {
	return &VideoService{DB: db, Logger: logger}
}

func (s *VideoService) UploadVideo(title string, file *multipart.FileHeader) (*models.Video, error) {
	s.Logger.Info("Uploading video to Bunny Stream", zap.String("filename", file.Filename))
	// Validate file type
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".mp4" && ext != ".mov" && ext != ".mkv" {
		return nil, fmt.Errorf("unsupported video file type: %s", ext)
	}
	bunnyAPI := config.AppConfig.BunnyStreamAPI
	bunnyKey := config.AppConfig.BunnyStreamAPIKey
	bunnyLib := config.AppConfig.BunnyStreamLibraryID
	bunnyHost := config.AppConfig.BunnyStreamHost
	if bunnyAPI == "" || bunnyKey == "" || bunnyLib == "" || bunnyHost == "" {
		s.Logger.Error("Bunny Stream config missing")
		return nil, fmt.Errorf("Bunny Stream config missing")
	}
	// Step 1: Create video entry in Bunny
	createReq := map[string]interface{}{
		"title":        title,
		"collectionId": bunnyLib,
	}
	body, _ := json.Marshal(createReq)
	req, _ := http.NewRequest("POST", bunnyAPI+"/library/videos", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("AccessKey", bunnyKey)
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode > 299 {
		s.Logger.Error("Bunny create video failed", zap.Error(err))
		return nil, fmt.Errorf("Bunny create video failed: %w", err)
	}
	var createResp struct {
		Guid string `json:"guid"`
	}
	json.NewDecoder(resp.Body).Decode(&createResp)
	resp.Body.Close()
	if createResp.Guid == "" {
		return nil, fmt.Errorf("Bunny did not return video guid")
	}
	// Step 2: Upload video file
	src, _ := file.Open()
	defer src.Close()
	uploadURL := fmt.Sprintf("%s/library/videos/%s", bunnyAPI, createResp.Guid)
	uploadReq, _ := http.NewRequest("PUT", uploadURL, src)
	uploadReq.Header.Set("AccessKey", bunnyKey)
	uploadReq.Header.Set("Content-Type", "application/octet-stream")
	uploadResp, err := http.DefaultClient.Do(uploadReq)
	if err != nil || uploadResp.StatusCode > 299 {
		s.Logger.Error("Bunny video upload failed", zap.Error(err))
		return nil, fmt.Errorf("Bunny video upload failed: %w", err)
	}
	uploadResp.Body.Close()
	cdnURL := fmt.Sprintf("https://%s/%s/playlist.m3u8", bunnyHost, createResp.Guid)
	video := &models.Video{
		ID:           uuid.New(),
		BunnyVideoID: createResp.Guid,
		Title:        title,
		CDNUrl:       cdnURL,
		CreatedAt:    time.Now(),
	}
	if err := s.DB.Create(video).Error; err != nil {
		s.Logger.Error("DB insert failed", zap.Error(err))
		return nil, err
	}
	s.Logger.Info("Video uploaded", zap.String("id", video.ID.String()), zap.String("cdn_url", video.CDNUrl))
	return video, nil
}

func (s *VideoService) GetVideo(id uuid.UUID) (*models.Video, error) {
	var video models.Video
	if err := s.DB.First(&video, "id = ?", id).Error; err != nil {
		s.Logger.Error("Video not found", zap.Error(err))
		return nil, err
	}
	return &video, nil
}

func (s *VideoService) DeleteVideo(id uuid.UUID) error {
	var video models.Video
	if err := s.DB.First(&video, "id = ?", id).Error; err != nil {
		s.Logger.Error("Video not found", zap.Error(err))
		return err
	}
	bunnyAPI := config.AppConfig.BunnyStreamAPI
	bunnyKey := config.AppConfig.BunnyStreamAPIKey
	if bunnyAPI == "" || bunnyKey == "" {
		s.Logger.Error("Bunny Stream config missing")
		return fmt.Errorf("Bunny Stream config missing")
	}
	deleteURL := fmt.Sprintf("%s/library/videos/%s", bunnyAPI, video.BunnyVideoID)
	req, _ := http.NewRequest("DELETE", deleteURL, nil)
	req.Header.Set("AccessKey", bunnyKey)
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode > 299 {
		s.Logger.Error("Bunny delete video failed", zap.Error(err))
		return fmt.Errorf("Bunny delete video failed: %w", err)
	}
	if err := s.DB.Delete(&video).Error; err != nil {
		s.Logger.Error("DB delete failed", zap.Error(err))
		return err
	}
	s.Logger.Info("Video deleted", zap.String("id", video.ID.String()))
	return nil
}
