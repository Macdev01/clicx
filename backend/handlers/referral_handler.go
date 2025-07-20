package handlers

import (
	"net/http"

	"go-backend/database"
	"go-backend/models"

	"github.com/gin-gonic/gin"
)

// GetReferrals lists invited users for the authenticated user.
func GetReferrals(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists || val == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	user := val.(*models.User)

	var refs []models.Referral
	if err := database.DB.Where("user_id = ?", user.ID).Find(&refs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}
	c.JSON(http.StatusOK, refs)
}
