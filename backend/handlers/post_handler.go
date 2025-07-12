package handlers

import (
	"go-backend/database"
	"go-backend/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetPosts(c *gin.Context) {
	var posts []models.Post
	if err := database.DB.Preload("User").
		Preload("Media").
		Preload("ModelProfile").
		Find(&posts).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, posts)
}

func GetPostByID(c *gin.Context) {
	id := c.Param("id")
	var post models.Post

	err := database.DB.
		Preload("User").
		Preload("Media").
		Preload("ModelProfile").
		Preload("Comments").
		Preload("Comments.User").
		First(&post, "id = ?", id).Error

	if err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusNotFound)
		return
	}

	userVal, exists := c.Get("user")
	if exists {
		_ = userVal.(models.User)
		post.IsPurchased = true
	} else {
		post.IsPurchased = false
	}

	c.JSON(http.StatusOK, post)
}

func CreatePost(c *gin.Context) {
	var post models.Post
	if err := c.ShouldBindJSON(&post); err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}
	if err := database.DB.Create(&post).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusCreated, post)
}

func UpdatePost(c *gin.Context) {
	id := c.Param("id")
	var post models.Post

	if err := database.DB.Preload("Media").
		Preload("User").
		Preload("ModelProfile").
		First(&post, "id = ?", id).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusNotFound)
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
			Name     string  `json:"name"`
			Nickname string  `json:"nickname"`
			Email    string  `json:"email"`
			Avatar   string  `json:"avatarUrl"`
			Balance  float64 `json:"balance"`
		} `json:"model"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	post.Text = input.Text
	post.IsPremium = input.IsPremium

	parsedTime, err := time.Parse(time.RFC3339, input.PublishedAt)
	if err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid published_time format (use RFC3339)"})
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
			c.Error(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
	}

	post.User.Name = input.Model.Name
	post.User.Nickname = input.Model.Nickname
	post.User.Email = input.Model.Email
	post.User.AvatarURL = input.Model.Avatar
	post.User.Balance = input.Model.Balance

	if err := tx.Save(&post.User).Error; err != nil {
		tx.Rollback()
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	if err := tx.Save(&post.ModelProfile).Error; err != nil {
		tx.Rollback()
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	if err := tx.Session(&gorm.Session{FullSaveAssociations: true}).Save(&post).Error; err != nil {
		tx.Rollback()
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	tx.Commit()

	database.DB.Preload("Media").
		Preload("User").
		Preload("ModelProfile").
		First(&post, "id = ?", id)

	c.JSON(http.StatusOK, post)
}

func DeletePost(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Post{}, "id = ?", id).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}
