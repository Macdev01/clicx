package handlers

import (
	"bytes"
	"crypto/md5"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"go-backend/config"
	"go-backend/database"
	"go-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ✅ Создать пост с медиа (только админ)
func CreatePostWithMedia(c *gin.Context) {
	value, _ := c.Get("user")
	user, _ := value.(*models.User)

	if user == nil || !user.IsAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admins only"})
		return
	}

	modelIDStr := c.PostForm("model_id")
	if modelIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "model_id is required"})
		return
	}

	modelID, err := strconv.Atoi(modelIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid model_id"})
		return
	}

	var modelProfile models.ModelProfile
	if err := database.DB.Preload("User").First(&modelProfile, modelID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Model not found"})
		return
	}

	text := c.PostForm("text")
	isPremium := c.PostForm("is_premium") == "true"

	post := models.Post{
		ID:          uuid.New(),
		Text:        text,
		IsPremium:   isPremium,
		PublishedAt: time.Now(),
		UserID:      modelProfile.UserID,
		ModelID:     modelProfile.ID,
	}
	if err := database.DB.Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post"})
		return
	}

	form, _ := c.MultipartForm()
	files := form.File["files"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "At least one file required"})
		return
	}

	var mediaList []models.Media
	for _, file := range files {
		f, _ := file.Open()
		defer f.Close()

		buf := bytes.NewBuffer(nil)
		io.Copy(buf, f)

		path := fmt.Sprintf("%d/%s", modelProfile.UserID, file.Filename)
		uploadURL := fmt.Sprintf("https://sg.storage.bunnycdn.com/%s/%s", config.AppConfig.BunnyStorageZone, path)

		req, _ := http.NewRequest("PUT", uploadURL, bytes.NewReader(buf.Bytes()))
		req.Header.Set("AccessKey", config.AppConfig.BunnyStorageKey)
		req.Header.Set("Content-Type", "application/octet-stream")

		resp, err := http.DefaultClient.Do(req)
		if err != nil || resp.StatusCode > 299 {
			c.JSON(http.StatusBadGateway, gin.H{"error": "Upload to Bunny failed"})
			return
		}

		cdnURL := fmt.Sprintf("https://%s/%s", config.AppConfig.BunnyPullZoneHost, path)

		ext := strings.ToLower(filepath.Ext(file.Filename))
		mediaType := "photo"
		if ext == ".mp4" || ext == ".mov" {
			mediaType = "video"
		}

		media := models.Media{
			PostID:   post.ID,
			Type:     mediaType,
			URL:      cdnURL,
			Duration: 0,
		}
		mediaList = append(mediaList, media)
	}

	if err := database.DB.Create(&mediaList).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save media"})
		return
	}

	post.Media = mediaList
	c.JSON(http.StatusOK, post)
}

// ✅ Загрузить видео для существующего поста (без авторизации блокировки)
func UploadVideo(c *gin.Context) {
	value, _ := c.Get("user")
	user, _ := value.(*models.User)

	ownerID := uint(0)
	if user != nil {
		ownerID = user.ID
	}

	file, err := c.FormFile("video")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No video file"})
		return
	}

	opened, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "File open error"})
		return
	}
	defer opened.Close()

	buf := bytes.NewBuffer(nil)
	io.Copy(buf, opened)

	path := fmt.Sprintf("%d/%s", ownerID, file.Filename)
	uploadURL := fmt.Sprintf("https://sg.storage.bunnycdn.com/%s/%s", config.AppConfig.BunnyStorageZone, path)

	req, _ := http.NewRequest("PUT", uploadURL, bytes.NewReader(buf.Bytes()))
	req.Header.Set("AccessKey", config.AppConfig.BunnyStorageKey)
	req.Header.Set("Content-Type", "application/octet-stream")

	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode > 299 {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to upload to Bunny"})
		return
	}

	postIDStr := c.PostForm("post_id")
	postUUID, err := uuid.Parse(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post_id"})
		return
	}

	cdnURL := fmt.Sprintf("https://%s/%s", config.AppConfig.BunnyPullZoneHost, path)

	media := models.Media{
		PostID:   postUUID,
		Type:     "video",
		URL:      cdnURL,
		Duration: 0,
	}

	if err := database.DB.Create(&media).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
		return
	}

	c.JSON(http.StatusOK, media)
}

// ✅ Получить медиа по ID
func GetMediaByID(c *gin.Context) {
	id := c.Param("id")

	var media models.Media
	if err := database.DB.First(&media, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Media not found"})
		return
	}

	c.JSON(http.StatusOK, media)
}

// ✅ Ссылка для стрима с токеном
func StreamVideo(c *gin.Context) {
	id := c.Param("id")

	var media models.Media
	if err := database.DB.First(&media, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Media not found"})
		return
	}

	if media.Type != "video" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Not a video"})
		return
	}

	expires := time.Now().Add(1 * time.Hour).Unix()
	urlPath := strings.TrimPrefix(media.URL, fmt.Sprintf("https://%s", config.AppConfig.BunnyPullZoneHost))
	raw := fmt.Sprintf("%s%s%d", config.AppConfig.BunnyTokenKey, urlPath, expires)

	hash := md5.Sum([]byte(raw))
	token := base64.StdEncoding.EncodeToString(hash[:])
	token = strings.NewReplacer("+", "-", "/", "_", "=", "").Replace(token)

	finalURL := fmt.Sprintf("%s?token=%s&expires=%d", media.URL, token, expires)

	c.JSON(http.StatusOK, gin.H{"url": finalURL})
}

// ✅ Удаление медиа (только админ или владелец поста)
func DeleteVideo(c *gin.Context) {
	value, _ := c.Get("user")
	user, _ := value.(*models.User)

	id := c.Param("id")

	var media models.Media
	if err := database.DB.First(&media, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Media not found"})
		return
	}

	var post models.Post
	if err := database.DB.First(&post, "id = ?", media.PostID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Только админ или владелец поста может удалить
	if user == nil || (!user.IsAdmin && post.UserID != user.ID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}

	urlPath := strings.TrimPrefix(media.URL, fmt.Sprintf("https://%s", config.AppConfig.BunnyPullZoneHost))
	deleteURL := fmt.Sprintf("https://sg.storage.bunnycdn.com/%s%s", config.AppConfig.BunnyStorageZone, urlPath)

	req, _ := http.NewRequest("DELETE", deleteURL, nil)
	req.Header.Set("AccessKey", config.AppConfig.BunnyStorageKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode > 299 {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to delete from Bunny"})
		return
	}

	if err := database.DB.Delete(&media).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete from DB"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted successfully"})
}

// GetUserVideos returns all posts with media uploaded by the current user
func GetUserVideos(c *gin.Context) {
	value, _ := c.Get("user")
	user, _ := value.(*models.User)

	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var posts []models.Post
	if err := database.DB.Preload("Media").
		Preload("ModelProfile").
		Preload("User").
		Where("user_id = ?", user.ID).
		Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch content"})
		return
	}

	c.JSON(http.StatusOK, posts)
}
