package services

import (
	"bytes"
	"fmt"
	"io"
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

type ImageService struct {
	DB     *gorm.DB
	Logger *zap.Logger
}

func NewImageService(db *gorm.DB, logger *zap.Logger) *ImageService {
	return &ImageService{DB: db, Logger: logger}
}

func (s *ImageService) UploadImage(file *multipart.FileHeader) (*models.Image, error) {
	s.Logger.Info("Uploading image to Bunny Storage", zap.String("filename", file.Filename))
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".gif" && ext != ".webp" {
		return nil, fmt.Errorf("unsupported image file type: %s", ext)
	}
	bunnyZone := config.AppConfig.BunnyStorageZone
	bunnyKey := config.AppConfig.BunnyStorageAPIKey
	bunnyHost := config.AppConfig.BunnyStorageHost
	if bunnyZone == "" || bunnyKey == "" || bunnyHost == "" {
		s.Logger.Error("Bunny Storage config missing")
		return nil, fmt.Errorf("Bunny Storage config missing")
	}
	imgID := uuid.New()
	filename := imgID.String() + ext
	src, _ := file.Open()
	defer src.Close()
	buf := bytes.NewBuffer(nil)
	io.Copy(buf, src)
	uploadURL := fmt.Sprintf("https://sg.storage.bunnycdn.com/%s/%s", bunnyZone, filename)
	req, _ := http.NewRequest("PUT", uploadURL, bytes.NewReader(buf.Bytes()))
	req.Header.Set("AccessKey", bunnyKey)
	req.Header.Set("Content-Type", "application/octet-stream")
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode > 299 {
		s.Logger.Error("Bunny image upload failed", zap.Error(err))
		return nil, fmt.Errorf("Bunny image upload failed: %w", err)
	}
	cdnURL := fmt.Sprintf("https://%s/%s", bunnyHost, filename)
	image := &models.Image{
		ID:        imgID,
		Filename:  filename,
		CDNUrl:    cdnURL,
		CreatedAt: time.Now(),
	}
	if err := s.DB.Create(image).Error; err != nil {
		s.Logger.Error("DB insert failed", zap.Error(err))
		return nil, err
	}
	s.Logger.Info("Image uploaded", zap.String("id", image.ID.String()), zap.String("cdn_url", image.CDNUrl))
	return image, nil
}

func (s *ImageService) GetImage(id uuid.UUID) (*models.Image, error) {
	var image models.Image
	if err := s.DB.First(&image, "id = ?", id).Error; err != nil {
		s.Logger.Error("Image not found", zap.Error(err))
		return nil, err
	}
	return &image, nil
}

func (s *ImageService) DeleteImage(id uuid.UUID) error {
	var image models.Image
	if err := s.DB.First(&image, "id = ?", id).Error; err != nil {
		s.Logger.Error("Image not found", zap.Error(err))
		return err
	}
	bunnyZone := config.AppConfig.BunnyStorageZone
	bunnyKey := config.AppConfig.BunnyStorageAPIKey
	if bunnyZone == "" || bunnyKey == "" {
		s.Logger.Error("Bunny Storage config missing")
		return fmt.Errorf("Bunny Storage config missing")
	}
	deleteURL := fmt.Sprintf("https://sg.storage.bunnycdn.com/%s/%s", bunnyZone, image.Filename)
	req, _ := http.NewRequest("DELETE", deleteURL, nil)
	req.Header.Set("AccessKey", bunnyKey)
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode > 299 {
		s.Logger.Error("Bunny image delete failed", zap.Error(err))
		return fmt.Errorf("Bunny image delete failed: %w", err)
	}
	if err := s.DB.Delete(&image).Error; err != nil {
		s.Logger.Error("DB delete failed", zap.Error(err))
		return err
	}
	s.Logger.Info("Image deleted", zap.String("id", image.ID.String()))
	return nil
}
