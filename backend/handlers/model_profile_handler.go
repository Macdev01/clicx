package handlers

import (
	"go-backend/database"
	"go-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ModelProfileInput struct {
	UserID uint   `json:"user_id" binding:"required"`
	Bio    string `json:"bio"`
	Banner string `json:"banner"`
}

func GetModelProfiles(c *gin.Context) {
	var profiles []models.ModelProfile
	if err := database.DB.Preload("User").Find(&profiles).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, profiles)
}

func GetModelProfileByID(c *gin.Context) {
	id := c.Param("id")
	var profile models.ModelProfile
	if err := database.DB.Preload("User").First(&profile, id).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusNotFound)
		return
	}
	c.JSON(http.StatusOK, profile)
}

func CreateModelProfile(c *gin.Context) {
	var input ModelProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input: " + err.Error()})
		return
	}

	var user models.User
	if err := database.DB.First(&user, input.UserID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user not found"})
		return
	}

	var existing models.ModelProfile
	if err := database.DB.Where("user_id = ?", input.UserID).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "model profile already exists for this user"})
		return
	}

	profile := models.ModelProfile{
		UserID: input.UserID,
		Bio:    input.Bio,
		Banner: input.Banner,
	}

	if err := database.DB.Create(&profile).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create model profile: " + err.Error()})
		return
	}

	database.DB.Preload("User").First(&profile, profile.ID)
	c.JSON(http.StatusCreated, profile)
}

func UpdateModelProfile(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	var existing models.ModelProfile
	if err := database.DB.Preload("User").First(&existing, id).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusNotFound)
		return
	}

	var input struct {
		Bio    string `json:"bio"`
		Banner string `json:"banner"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	existing.Bio = input.Bio
	existing.Banner = input.Banner

	if err := database.DB.Save(&existing).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	database.DB.Preload("User").First(&existing, id)
	c.JSON(http.StatusOK, existing)
}

func DeleteModelProfile(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	var profile models.ModelProfile
	if err := database.DB.First(&profile, id).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusNotFound)
		return
	}

	if err := database.DB.Delete(&profile).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Model profile deleted"})
}

func GetModelProfileByUserID(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	var profile models.ModelProfile
	if err := database.DB.Preload("User").Where("user_id = ?", userID).First(&profile).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusNotFound)
		return
	}

	c.JSON(http.StatusOK, profile)
}
