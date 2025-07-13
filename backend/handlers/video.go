package handlers

import (
	"bytes"
	"crypto/md5"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"go-backend/config"
	"go-backend/database"
	"go-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

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

	postID := c.PostForm("post_id") // UUID
	uuidPostID, err := uuid.Parse(postID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post_id"})
		return
	}
	media := models.Media{
		PostID:   uuidPostID,
		Type:     "video",
		URL:      "/" + path,
		Duration: 0, // позже можно вычислить
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
