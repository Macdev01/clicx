package services

import (
	"mime/multipart"
	"os"
	"path/filepath"
	"testing"

	"go-backend/models"

	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type mockLogger struct{}

func (m *mockLogger) Info(msg string, fields ...zap.Field)  {}
func (m *mockLogger) Error(msg string, fields ...zap.Field) {}

func createTestVideoFile(t *testing.T) (string, *multipart.FileHeader) {
	dir := t.TempDir()
	filePath := filepath.Join(dir, "test.mp4")
	_ = os.WriteFile(filePath, []byte("dummy video content"), 0644)
	file, _ := os.Open(filePath)
	stat, _ := file.Stat()
	fh := &multipart.FileHeader{
		Filename: filepath.Base(filePath),
		Size:     stat.Size(),
	}
	return filePath, fh
}

func TestUploadVideo_Success(t *testing.T) {
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&models.Video{})
	logger := zap.NewNop()
	service := NewVideoService(db, logger)

	filePath, fh := createTestVideoFile(t)
	defer os.Remove(filePath)

	video, err := service.UploadVideo("Test Title", fh)
	assert.NoError(t, err)
	assert.NotNil(t, video)
	assert.Equal(t, "Test Title", video.Title)
	assert.NotEmpty(t, video.BunnyVideoID)
	assert.NotEmpty(t, video.CDNUrl)
}

func TestUploadVideo_UnsupportedType(t *testing.T) {
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&models.Video{})
	logger := zap.NewNop()
	service := NewVideoService(db, logger)

	dir := t.TempDir()
	filePath := filepath.Join(dir, "test.txt")
	_ = os.WriteFile(filePath, []byte("not a video"), 0644)
	file, _ := os.Open(filePath)
	stat, _ := file.Stat()
	fh := &multipart.FileHeader{
		Filename: filepath.Base(filePath),
		Size:     stat.Size(),
	}
	defer os.Remove(filePath)

	video, err := service.UploadVideo("Test Title", fh)
	assert.Error(t, err)
	assert.Nil(t, video)
}

func TestUploadVideo_DBInsertFails(t *testing.T) {
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	// Do not migrate Video table to force insert error
	logger := zap.NewNop()
	service := NewVideoService(db, logger)

	filePath, fh := createTestVideoFile(t)
	defer os.Remove(filePath)

	video, err := service.UploadVideo("Test Title", fh)
	assert.Error(t, err)
	assert.Nil(t, video)
}
