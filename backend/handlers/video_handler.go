package handlers

import (
	"go-backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var videoService *services.VideoService

func InitVideoHandler(service *services.VideoService) {
	videoService = service
}

// POST /videos/upload
func UploadVideo(c *gin.Context) {
	title := c.PostForm("title")
	file, err := c.FormFile("video")
	if err != nil || title == "" {
		videoService.Logger.Error("Invalid video upload request")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing title or video file"})
		return
	}
	video, err := videoService.UploadVideo(title, file)
	if err != nil {
		videoService.Logger.Error("Video upload failed")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, video)
}

// GET /videos/:id
func GetVideo(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		videoService.Logger.Error("Invalid video id")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid video id"})
		return
	}
	video, err := videoService.GetVideo(id)
	if err != nil {
		videoService.Logger.Error("Video not found")
		c.JSON(http.StatusNotFound, gin.H{"error": "Video not found"})
		return
	}
	c.JSON(http.StatusOK, video)
}

// DELETE /videos/:id
func DeleteVideo(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		videoService.Logger.Error("Invalid video id")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid video id"})
		return
	}
	if err := videoService.DeleteVideo(id); err != nil {
		videoService.Logger.Error("Video delete failed")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Video deleted"})
}
