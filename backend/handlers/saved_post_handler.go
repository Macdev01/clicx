package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"go-backend/database"
	"go-backend/models"
)

// ToggleSavePost adds or removes a post from user's saved list.
func ToggleSavePost(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists || val == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	user := val.(*models.User)

	postIDStr := c.Param("id")
	postID, err := uuid.Parse(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
		return
	}

	var saved models.SavedPost
	err = database.DB.Where("user_id = ? AND post_id = ?", user.ID, postID).First(&saved).Error
	if err == nil {
		if err := database.DB.Delete(&saved).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to unsave"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "post unsaved"})
		return
	}
	if err != nil && err != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}

	saved = models.SavedPost{UserID: user.ID, PostID: postID}
	if err := database.DB.Create(&saved).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "post saved"})
}

// GetSavedPosts returns posts saved by the specified user.
func GetSavedPosts(c *gin.Context) {
	userID := c.Param("id")
	var posts []models.Post
	if err := database.DB.Joins("JOIN saved_posts ON saved_posts.post_id = posts.id").
		Where("saved_posts.user_id = ?", userID).
		Preload("User").Preload("Media").Preload("ModelProfile").
		Find(&posts).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, posts)
}

// GetPurchasedPosts returns posts purchased by the specified user.
func GetPurchasedPosts(c *gin.Context) {
	userID := c.Param("id")
	var posts []models.Post
	if err := database.DB.Joins("JOIN purchases ON purchases.post_id = posts.id").
		Where("purchases.user_id = ?", userID).
		Preload("User").Preload("Media").Preload("ModelProfile").
		Find(&posts).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, posts)
}
