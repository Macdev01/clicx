package handlers

import (
	"go-backend/database"
	"go-backend/models"
	"net/http"
	"strconv"

	"go-backend/dto"
	"go-backend/repository"
	"go-backend/services"
	"go-backend/utils"

	"github.com/gin-gonic/gin"
)

type ModelProfileInput struct {
	UserID uint   `json:"user_id" binding:"required" validate:"required"`
	Name   string `json:"name" validate:"required,min=2,max=64"`
	Bio    string `json:"bio" validate:"max=512"`
	Banner string `json:"banner"`
}

func GetModelProfiles(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")
	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)
	profileRepo := &repository.GormModelProfileRepository{DB: database.GetDB()}
	service := services.NewModelProfileService(profileRepo)
	resp, err := service.GetModelProfiles(limit, offset)
	if err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	c.JSON(http.StatusOK, resp)
}

func GetModelProfileByID(c *gin.Context) {
	id := c.Param("id")
	var profile models.ModelProfile
	if err := database.DB.Preload("User").First(&profile, id).Error; err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}
	c.JSON(http.StatusOK, profile)
}

func CreateModelProfile(c *gin.Context) {
	var input dto.ModelProfileCreateDTO
	if err := c.ShouldBindJSON(&input); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	if err := utils.ValidateStruct(input); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}
	profileRepo := &repository.GormModelProfileRepository{DB: database.GetDB()}
	service := services.NewModelProfileService(profileRepo)
	resp, err := service.CreateModelProfile(&input)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Could not create model profile"})
		return
	}
	c.JSON(http.StatusCreated, resp)
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
		Name   string `json:"name"`
		Bio    string `json:"bio"`
		Banner string `json:"banner"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	existing.Name = input.Name
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
