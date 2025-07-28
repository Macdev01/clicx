package handlers

import (
	"encoding/json"
	"go-backend/database"
	"go-backend/models"
	"net/http"

	"go-backend/services"
	"path/filepath"

	"math/rand"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type BatchUploadMetadata struct {
	Filename    string   `json:"filename"`
	Type        string   `json:"type"` // "photo" or "video"
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Tags        []string `json:"tags"`
	Category    string   `json:"category"`
}

// GET /models/:modelId/photos/:photoId/url
func GetPhotoURL(c *gin.Context) {
	user, ok := GetCurrentUser(c) // Use your existing auth helper
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	photoIdStr := c.Param("photoId")
	photoId, err := uuid.Parse(photoIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid photo ID"})
		return
	}
	// Check purchase/access
	if !HasUserPurchasedPhoto(user.ID, photoId) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}
	var media models.Media
	if err := database.DB.First(&media, "id = ? AND type = ?", photoId, "photo").Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Photo not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"url": media.URL})
}

// GET /models/:modelId/videos/:videoId/url
func GetVideoURL(c *gin.Context) {
	user, ok := GetCurrentUser(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	videoIdStr := c.Param("videoId")
	videoId, err := uuid.Parse(videoIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid video ID"})
		return
	}
	if !HasUserPurchasedVideo(user.ID, videoId) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}
	var video models.Video
	if err := database.DB.First(&video, "id = ?", videoId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Video not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"url": video.CDNUrl})
}

// POST /admin/models/:modelId/portfolio/batch
func BatchUploadPortfolio(c *gin.Context) {
	// modelId, _ := strconv.Atoi(c.Param("modelId")) // Unused, remove
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form data"})
		return
	}
	files := form.File["files[]"]
	metadataRaw := form.Value["metadata"]
	if len(metadataRaw) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing metadata"})
		return
	}
	var metadata []BatchUploadMetadata
	if err := json.Unmarshal([]byte(metadataRaw[0]), &metadata); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid metadata JSON"})
		return
	}
	// Map filename to metadata
	metaMap := make(map[string]BatchUploadMetadata)
	for _, m := range metadata {
		metaMap[m.Filename] = m
	}
	var uploaded []interface{}
	for _, fileHeader := range files {
		meta, ok := metaMap[fileHeader.Filename]
		if !ok {
			continue // skip files without metadata
		}
		file, err := fileHeader.Open()
		if err != nil {
			continue
		}
		defer file.Close()
		ext := filepath.Ext(fileHeader.Filename)
		randName := randomString(8) + ext
		if meta.Type == "photo" {
			// Upload to Bunny Storage (stub if missing)
			url, err := services.UploadPhotoToBunnyStorage(file, "photos/"+randName)
			if err != nil {
				continue
			}
			photo := models.Media{
				Type:     "photo",
				PostID:   uuid.Nil, // or set if you have a post
				URL:      url,
				Cover:    "",
				Duration: 0,
				// Add metadata fields as needed
			}
			database.DB.Create(&photo)
			uploaded = append(uploaded, photo)
		} else if meta.Type == "video" {
			// Upload to Bunny Stream (stub if missing)
			bunnyID, url, err := services.UploadVideoToBunnyStream(file, "videos/"+randName)
			if err != nil {
				continue
			}
			video := models.Video{
				BunnyVideoID: bunnyID,
				Title:        meta.Title,
				CDNUrl:       url,
				// Add other metadata fields
			}
			database.DB.Create(&video)
			uploaded = append(uploaded, video)
		}
	}
	c.JSON(http.StatusOK, gin.H{"uploaded": uploaded})
}

// Helper for random string (replace RandString)
const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func randomString(n int) string {
	rand.Seed(time.Now().UnixNano())
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func HasUserPurchasedPhoto(userID, photoID uuid.UUID) bool {
	var count int64
	database.DB.Model(&models.Purchase{}).
		Where("user_id = ? AND photo_id = ?", userID, photoID).
		Count(&count)
	return count > 0
}

// Fix HasUserPurchasedVideo to use uuid.UUID for videoID
func HasUserPurchasedVideo(userID, videoID uuid.UUID) bool {
	var count int64
	database.DB.Model(&models.Purchase{}).
		Where("user_id = ? AND video_id = ?", userID, videoID).
		Count(&count)
	return count > 0
}

// Dummy current user getter (replace with your real auth logic)
func GetCurrentUser(c *gin.Context) (*models.User, bool) {
	val, exists := c.Get("user")
	if !exists || val == nil {
		return nil, false
	}
	user, ok := val.(*models.User)
	return user, ok
}
