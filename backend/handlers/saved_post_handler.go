package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"go-backend/database"
	"go-backend/models"
	"go-backend/repository"
	"go-backend/services"
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

	savedPostRepo := &repository.GormSavedPostRepository{DB: database.GetDB()}
	var saved models.SavedPost
	saved, err = savedPostRepo.FindByUserAndPost(user.ID, postID)
	if err == nil {
		if err := savedPostRepo.Delete(&saved); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not unsave post"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "post unsaved"})
		return
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	saved = models.SavedPost{UserID: user.ID, PostID: postID}
	if err := savedPostRepo.Create(&saved); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save post"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "post saved"})
}

// GetSavedPosts returns posts saved by the specified user.
func GetSavedPosts(c *gin.Context) {
	userID := c.Param("id")
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")
	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)
	savedPostRepo := &repository.GormSavedPostRepository{DB: database.GetDB()}
	service := services.NewSavedPostService(savedPostRepo)
	resp, err := service.GetSavedPosts(userID, limit, offset)
	if err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, resp)
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

// GET /videos/saved (for current user)
func GetMySavedVideos(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists || val == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	user := val.(*models.User)
	getSavedVideosForUser(c, user.ID)
}

// GET /users/:id/saved-videos (for admin or self)
func GetSavedVideosByUserID(c *gin.Context) {
	// Require authenticated user
	val, exists := c.Get("user")
	if !exists || val == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	currentUser := val.(*models.User)

	userIDStr := c.Param("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	// Allow only admin or self
	if !currentUser.IsAdmin && currentUser.ID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}
	getSavedVideosForUser(c, userID)
}

// Helper to fetch and return saved videos for a user
func getSavedVideosForUser(c *gin.Context, userID uuid.UUID) {
	db := database.GetDB()
	var results []struct {
		ID        string    `json:"id"`
		Title     string    `json:"title"`
		CDNUrl    string    `json:"cdn_url"`
		Thumbnail string    `json:"thumbnail"`
		CreatedAt time.Time `json:"created_at"`
	}
	query := `
	SELECT p.id, p.text as title, m.url as cdn_url, m.cover as thumbnail, p.published_at as created_at
	FROM saved_posts s
	JOIN posts p ON s.post_id = p.id
	LEFT JOIN media m ON m.post_id = p.id
	WHERE s.user_id = ?
	GROUP BY p.id, m.url, m.cover, p.published_at
	ORDER BY s.created_at DESC`
	db.Raw(query, userID).Scan(&results)
	c.JSON(http.StatusOK, results)
}
