package handlers

import (
	"go-backend/database"
	"go-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

type BunnyWebhookPayload struct {
	FileName   string `json:"fileName"`
	StorageURL string `json:"storageUrl"`
}

func BunnyWebhook(c *gin.Context) {
	var payload BunnyWebhookPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	if err := database.DB.Model(&models.Media{}).
		Where("url LIKE ?", "%"+payload.FileName).
		Updates(map[string]interface{}{"uploaded": true}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB update failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "updated"})
}
