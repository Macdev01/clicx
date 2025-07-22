package handlers

import (
	"go-backend/database"
	"go-backend/models"
	"net/http"
	"strconv"
	"time"

	"go-backend/dto"
	"go-backend/repository"
	"go-backend/services"
	"go-backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetPosts godoc
// @Summary      List posts
// @Tags         posts
// @Produce      json
// @Success      200 {array} models.Post
// @Router       /posts [get]
func GetPosts(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")
	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)
	postRepo := &repository.GormPostRepository{DB: database.GetDB()}
	service := services.NewPostService(postRepo)
	resp, err := service.GetPosts(limit, offset)
	if err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, resp)
}

// GetPostByID godoc
// @Summary      Get post by ID
// @Tags         posts
// @Produce      json
// @Param        id   path      int  true  "Post ID"
// @Success      200 {object} models.Post
// @Failure      404 {object} gin.H
// @Router       /posts/{id} [get]
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
		c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	userVal, exists := c.Get("user")
	if exists {
		if _, ok := userVal.(*models.User); ok {
			// user is authenticated
		}
		post.IsPurchased = true
	} else {
		post.IsPurchased = false
	}

	c.JSON(http.StatusOK, post)
}

// CreatePost godoc
// @Summary      Create post
// @Tags         posts
// @Accept       json
// @Produce      json
// @Param        post  body      models.Post  true  "Post"
// @Success      201 {object} models.Post
// @Failure      400 {object} gin.H
// @Router       /posts [post]
func CreatePost(c *gin.Context) {
	var input dto.PostCreateDTO
	if err := c.ShouldBindJSON(&input); err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}
	if err := utils.ValidateStruct(input); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}
	postRepo := &repository.GormPostRepository{DB: database.GetDB()}
	service := services.NewPostService(postRepo)
	resp, err := service.CreatePost(&input)
	if err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusCreated, resp)
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
			Name     string `json:"name"`
			Nickname string `json:"nickname"`
			Email    string `json:"email"`
			Avatar   string `json:"avatarUrl"`
			Balance  int    `json:"balance"`
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

	post.ModelProfile.Name = input.Model.Name
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
