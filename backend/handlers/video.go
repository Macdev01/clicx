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
)

func CreatePostWithMedia(c *gin.Context) {
	user := c.MustGet("user").(models.User)

	// Проверка, что пользователь админ
	if !user.IsAdmin {
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

	// Проверка существования модели
	var modelProfile models.ModelProfile
	if err := database.DB.Preload("User").First(&modelProfile, modelID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Model not found"})
		return
	}

	text := c.PostForm("text")
	isPremium := c.PostForm("is_premium") == "true"

	// Создаём новый пост
	post := models.Post{
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

	// Загружаем файлы
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
		uploadURL := fmt.Sprintf("https://storage.bunnycdn.com/%s/%s", config.AppConfig.BunnyStorageZone, path)

		req, _ := http.NewRequest("PUT", uploadURL, bytes.NewReader(buf.Bytes()))
		req.Header.Set("AccessKey", config.AppConfig.BunnyStorageKey)
		req.Header.Set("Content-Type", "application/octet-stream")

		resp, err := http.DefaultClient.Do(req)
		if err != nil || resp.StatusCode > 299 {
			c.JSON(http.StatusBadGateway, gin.H{"error": "Upload to Bunny failed"})
			return
		}

		// Определяем тип по расширению
		ext := strings.ToLower(filepath.Ext(file.Filename))
		mediaType := "photo"
		if ext == ".mp4" || ext == ".mov" {
			mediaType = "video"
		}

		media := models.Media{
			PostID:   post.ID,
			Type:     mediaType,
			URL:      "/" + path,
			Duration: 0,
		}
		mediaList = append(mediaList, media)
	}

	// Сохраняем все медиа
	if err := database.DB.Create(&mediaList).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save media"})
		return
	}

	// Возвращаем пост с медиа
	post.Media = mediaList
	c.JSON(http.StatusOK, post)
}

func UploadVideo(c *gin.Context) {
	user := c.MustGet("user").(models.User)

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
	if _, err := io.Copy(buf, opened); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Read error"})
		return
	}

	path := fmt.Sprintf("%d/%s", user.ID, file.Filename)
	uploadURL := fmt.Sprintf("https://storage.bunnycdn.com/%s/%s", config.AppConfig.BunnyStorageZone, path)

	req, _ := http.NewRequest("PUT", uploadURL, bytes.NewReader(buf.Bytes()))
	req.Header.Set("AccessKey", config.AppConfig.BunnyStorageKey)
	req.Header.Set("Content-Type", "application/octet-stream")

	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode > 299 {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to upload to Bunny"})
		return
	}

	postIDStr := c.PostForm("post_id")
	postID, err := strconv.ParseUint(postIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post_id"})
		return
	}

	media := models.Media{
		PostID:   uint(postID),
		Type:     "video",
		URL:      "/" + path,
		Duration: 0,
	}

	if err := database.DB.Create(&media).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
		return
	}

	c.JSON(http.StatusOK, media)
}

func StreamVideo(c *gin.Context) {
	user := c.MustGet("user").(models.User)
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

	var post models.Post
	if err := database.DB.First(&post, "id = ?", media.PostID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	if post.UserID != user.ID && !post.IsPurchased {
		c.JSON(http.StatusForbidden, gin.H{"error": "No access"})
		return
	}

	// === Генерация токена ===
	expires := time.Now().Add(1 * time.Hour).Unix()
	path := media.URL // должно быть вида "/user_id/video.mp4"
	tokenKey := config.AppConfig.BunnyTokenKey
	raw := tokenKey + path + strconv.FormatInt(expires, 10)

	hash := md5.Sum([]byte(raw))
	token := base64.StdEncoding.EncodeToString(hash[:])
	token = strings.
		NewReplacer("+", "-", "/", "_", "=", "").
		Replace(token)

	// Итоговая ссылка
	finalURL := fmt.Sprintf("https://%s%s?token=%s&expires=%d",
		config.AppConfig.BunnyPullZoneHost,
		path, token, expires)

	c.JSON(http.StatusOK, gin.H{"url": finalURL})
}

func DeleteVideo(c *gin.Context) {
	user := c.MustGet("user").(models.User)
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

	if post.UserID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}

	// Удаление с Bunny
	deleteURL := fmt.Sprintf("https://storage.bunnycdn.com/%s%s", config.AppConfig.BunnyStorageZone, media.URL)
	req, _ := http.NewRequest("DELETE", deleteURL, nil)
	req.Header.Set("AccessKey", config.AppConfig.BunnyStorageKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode > 299 {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to delete from Bunny"})
		return
	}

	// Удаление из БД
	database.DB.Delete(&media)

	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}
