package handlers

import (
	"go-backend/database"
	"go-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func ToggleLikePost(c *gin.Context) {
	val := c.MustGet("user")
	user := val.(*models.User)

	postIDStr := c.Param("id")
	postUUID, err := uuid.Parse(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	var post models.Post
	if err := database.DB.First(&post, "id = ?", postUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	var like models.Like
	err = database.DB.Where("user_id = ? AND post_id = ?", user.ID, post.ID).First(&like).Error

	if err == nil {
		// Уже лайкал → удаляем
		if err := database.DB.Delete(&like).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not unlike post"})
			return
		}
		post.LikesCount--
		database.DB.Save(&post)
		c.JSON(http.StatusOK, gin.H{"message": "Like removed", "likes_count": post.LikesCount})
		return
	}

	// Добавляем лайк
	newLike := models.Like{UserID: user.ID, PostID: post.ID}
	if err := database.DB.Create(&newLike).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not like post"})
		return
	}

	post.LikesCount++
	database.DB.Save(&post)

	c.JSON(http.StatusOK, gin.H{"message": "Like added", "likes_count": post.LikesCount})
}
