package handlers

import (
	"mvp-go-backend/database"
	"mvp-go-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetModelProfiles(c *gin.Context) {
	var profiles []models.ModelProfile
	if err := database.DB.Preload("User").Find(&profiles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, profiles)
}

func GetModelProfileByID(c *gin.Context) {
	id := c.Param("id")
	var profile models.ModelProfile
	if err := database.DB.Preload("User").First(&profile, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Model profile not found"})
		return
	}
	c.JSON(http.StatusOK, profile)
}

func CreateModelProfile(c *gin.Context) {
	var profile models.ModelProfile
	if err := c.ShouldBindJSON(&profile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx := database.DB.Begin()

	if err := tx.Create(&profile.User).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create user: " + err.Error()})
		return
	}

	profile.UserID = profile.User.ID

	if err := tx.Create(&profile).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create profile: " + err.Error()})
		return
	}

	tx.Commit()

	// Подгружаем User для ответа
	database.DB.Preload("User").First(&profile, profile.ID)
	c.JSON(http.StatusCreated, profile)
}

func UpdateModelProfile(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var existing models.ModelProfile
	if err := database.DB.Preload("User").First(&existing, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Model profile not found"})
		return
	}

	var input models.ModelProfile
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Обновление
	existing.Bio = input.Bio
	existing.Banner = input.Banner
	existing.User.Name = input.User.Name
	existing.User.Email = input.User.Email
	existing.User.Nickname = input.User.Nickname
	existing.User.AvatarURL = input.User.AvatarURL
	existing.User.Balance = input.User.Balance
	if input.User.Password != "" {
		existing.User.Password = input.User.Password
	}

	tx := database.DB.Begin()

	if err := tx.Save(&existing.User).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot update user: " + err.Error()})
		return
	}
	if err := tx.Save(&existing).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot update profile: " + err.Error()})
		return
	}

	tx.Commit()

	database.DB.Preload("User").First(&existing, id)
	c.JSON(http.StatusOK, existing)
}

func DeleteModelProfile(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var profile models.ModelProfile
	if err := database.DB.First(&profile, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Model profile not found"})
		return
	}

	// Удаляем profile, но оставляем User (или добавь удаление User, если нужно)
	if err := database.DB.Delete(&profile).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot delete profile: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Model profile deleted"})
}
