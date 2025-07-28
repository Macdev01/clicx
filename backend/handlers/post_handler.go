package handlers

import (
	"go-backend/database"
	"go-backend/dto"
	"go-backend/models"
	"go-backend/services"
	"go-backend/utils"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func GetPosts(c *gin.Context) {
	limit, offset := utils.GetPagination(c)
	postRepo := services.NewPostService(nil) // Replace with DI if available
	resp, err := postRepo.GetPosts(limit, offset)
	if err != nil {
		utils.AbortWithError(c, http.StatusInternalServerError, "Failed to get posts", err)
		return
	}
	c.JSON(http.StatusOK, resp)
}

func GetPostByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.AbortWithError(c, http.StatusBadRequest, "Invalid post ID", err)
		return
	}
	var post models.Post
	err = database.DB.
		Preload("User").
		Preload("Media").
		Preload("ModelProfile").
		Preload("Comments").
		Preload("Comments.User").
		First(&post, "id = ?", id).Error

	if err != nil {
		utils.AbortWithError(c, http.StatusNotFound, "Post not found", err)
		return
	}

	userVal, exists := c.Get("user")
	if exists {
		if _, ok := userVal.(*models.User); ok {
			post.IsPurchased = true
		}
	} else {
		post.IsPurchased = false
	}

	c.JSON(http.StatusOK, post)
}

func CreatePost(c *gin.Context) {
	var input struct {
		Text      string    `json:"text"`
		IsPremium bool      `json:"isPremium"`
		UserID    uuid.UUID `json:"userId"`
		ModelID   uuid.UUID `json:"modelId"`
	}
	if !utils.BindAndValidate(c, &input) {
		return
	}
	postRepo := services.NewPostService(nil) // Replace with DI if available
	dto := &dto.PostCreateDTO{
		Text:      input.Text,
		IsPremium: input.IsPremium,
		UserID:    input.UserID,
		ModelID:   input.ModelID,
	}
	resp, err := postRepo.CreatePost(dto)
	if err != nil {
		utils.AbortWithError(c, http.StatusInternalServerError, "Failed to create post", err)
		return
	}
	c.JSON(http.StatusCreated, resp)
}

func UpdatePost(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.AbortWithError(c, http.StatusBadRequest, "Invalid post ID", err)
		return
	}
	var post models.Post
	if err := database.DB.Preload("Media").Preload("User").Preload("ModelProfile").First(&post, "id = ?", id).Error; err != nil {
		utils.AbortWithError(c, http.StatusNotFound, "Post not found", err)
		return
	}
	var input struct {
		Text        string `json:"text"`
		IsPremium   bool   `json:"isPremium"`
		PublishedAt string `json:"published_time"`
		Media       struct {
			Type     string `json:"type"`
			URL      string `json:"url"`
			Cover    string `json:"cover"`
			Duration int    `json:"duration"`
		} `json:"media"`
		Model struct {
			Name     string `json:"name"`
			Nickname string `json:"nickname"`
			Email    string `json:"email"`
			Avatar   string `json:"avatarUrl"`
			Balance  int    `json:"balance"`
		} `json:"model"`
	}
	if !utils.BindAndValidate(c, &input) {
		return
	}
	post.Text = input.Text
	post.IsPremium = input.IsPremium
	parsedTime, err := time.Parse(time.RFC3339, input.PublishedAt)
	if err != nil {
		utils.AbortWithError(c, http.StatusBadRequest, "invalid published_time format (use RFC3339)", err)
		return
	}
	post.PublishedAt = parsedTime
	tx := database.DB.Begin()
	if len(post.Media) > 0 {
		post.Media[0].Type = input.Media.Type
		post.Media[0].URL = input.Media.URL
		post.Media[0].Cover = input.Media.Cover
		post.Media[0].Duration = input.Media.Duration
		if err := tx.Save(&post.Media[0]).Error; err != nil {
			tx.Rollback()
			utils.AbortWithError(c, http.StatusInternalServerError, "Failed to update media", err)
			return
		}
	}
	post.ModelProfile.Name = input.Model.Name
	post.User.Nickname = input.Model.Nickname
	post.User.Email = input.Model.Email
	post.User.AvatarURL = input.Model.Avatar
	post.User.Balance = input.Model.Balance
	if err := tx.Save(&post.User).Error; err != nil {
		tx.Rollback()
		utils.AbortWithError(c, http.StatusInternalServerError, "Failed to update user", err)
		return
	}
	if err := tx.Save(&post.ModelProfile).Error; err != nil {
		tx.Rollback()
		utils.AbortWithError(c, http.StatusInternalServerError, "Failed to update model profile", err)
		return
	}
	if err := tx.Session(&gorm.Session{FullSaveAssociations: true}).Save(&post).Error; err != nil {
		tx.Rollback()
		utils.AbortWithError(c, http.StatusInternalServerError, "Failed to update post", err)
		return
	}
	tx.Commit()
	database.DB.Preload("Media").Preload("User").Preload("ModelProfile").First(&post, "id = ?", id)
	c.JSON(http.StatusOK, post)
}

func DeletePost(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}
	if err := database.DB.Delete(&models.Post{}, "id = ?", id).Error; err != nil {
		utils.AbortWithError(c, http.StatusInternalServerError, "Failed to delete post", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}
