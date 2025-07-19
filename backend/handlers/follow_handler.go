package handlers

import (
	"net/http"

	"go-backend/database"
	"go-backend/models"

	"github.com/gin-gonic/gin"
)

// FollowUser handles POST /follow/:id to follow another user.
func FollowUser(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists || val == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	user := val.(*models.User)

	targetID := c.Param("id")
	var target models.User
	if err := database.DB.First(&target, targetID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// prevent duplicate follows
	var f models.Follow
	if err := database.DB.Where("follower_id = ? AND followed_id = ?", user.ID, target.ID).First(&f).Error; err == nil {
		c.JSON(http.StatusOK, gin.H{"message": "already following"})
		return
	}

	follow := models.Follow{FollowerID: user.ID, FollowedID: target.ID}
	if err := database.DB.Create(&follow).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "followed"})
}

// UnfollowUser handles DELETE /follow/:id.
func UnfollowUser(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists || val == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	user := val.(*models.User)

	targetID := c.Param("id")
	var f models.Follow
	if err := database.DB.Where("follower_id = ? AND followed_id = ?", user.ID, targetID).First(&f).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "not following"})
		return
	}
	if err := database.DB.Delete(&f).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "unfollowed"})
}

// GetFollowers returns the list of followers for the current user.
func GetFollowers(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists || val == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	user := val.(*models.User)

	var followers []models.Follow
	if err := database.DB.Where("followed_id = ?", user.ID).Find(&followers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}
	c.JSON(http.StatusOK, followers)
}
