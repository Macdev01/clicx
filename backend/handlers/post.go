package handlers

import (
	"go-backend/database"

	"go-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ToggleLikePost(c *gin.Context) {
	user := c.MustGet("user").(models.User)

	postID := c.Param("id")
	var post models.Post
	if err := database.DB.First(&post, "id = ?", postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	var like models.Like
	err := database.DB.Where("user_id = ? AND post_id = ?", user.ID, post.ID).First(&like).Error

	if err == nil {
		// Уже лайкал → удаляем лайк
		if err := database.DB.Delete(&like).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unlike"})
			return
		}
		post.LikesCount -= 1
		database.DB.Save(&post)
		c.JSON(http.StatusOK, gin.H{"message": "Like removed", "likes_count": post.LikesCount})
		return
	}

	// Лайка не было → добавляем
	newLike := models.Like{UserID: user.ID, PostID: post.ID}
	if err := database.DB.Create(&newLike).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like"})
		return
	}

	post.LikesCount += 1
	database.DB.Save(&post)

	c.JSON(http.StatusOK, gin.H{"message": "Like added", "likes_count": post.LikesCount})
}
