package handlers

import (
	"go-backend/database"
	"go-backend/models"
	"net/http"

	"go-backend/dto"
	"go-backend/repository"
	"go-backend/services"
	"go-backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ModelProfileInput struct {
	UserID uuid.UUID `json:"user_id" binding:"required" validate:"required"`
	Name   string    `json:"name" validate:"required,min=2,max=64"`
	Bio    string    `json:"bio" validate:"max=512"`
	Banner string    `json:"banner"`
}

func GetModelProfiles(c *gin.Context) {
	limit, offset := utils.GetPagination(c)
	profileRepo := &repository.GormModelProfileRepository{DB: database.GetDB()}
	service := services.NewModelProfileService(profileRepo)
	resp, err := service.GetModelProfiles(limit, offset)
	if err != nil {
		utils.AbortWithError(c, http.StatusInternalServerError, "Internal server error", err)
		return
	}
	c.JSON(http.StatusOK, resp)
}

func GetModelProfileByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.AbortWithError(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}
	var profile models.ModelProfile
	if err := database.DB.Preload("User").First(&profile, "id = ?", id).Error; err != nil {
		utils.AbortWithError(c, http.StatusNotFound, "Profile not found", err)
		return
	}
	c.JSON(http.StatusOK, profile)
}

func CreateModelProfile(c *gin.Context) {
	var input dto.ModelProfileCreateDTO
	if !utils.BindAndValidate(c, &input) {
		return
	}
	profileRepo := &repository.GormModelProfileRepository{DB: database.GetDB()}
	service := services.NewModelProfileService(profileRepo)
	resp, err := service.CreateModelProfile(&input)
	if err != nil {
		utils.AbortWithError(c, http.StatusInternalServerError, "Could not create model profile", err)
		return
	}
	c.JSON(http.StatusCreated, resp)
}

func UpdateModelProfile(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.AbortWithError(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}
	var existing models.ModelProfile
	if err := database.DB.Preload("User").First(&existing, id).Error; err != nil {
		utils.AbortWithError(c, http.StatusNotFound, "Profile not found", err)
		return
	}
	var input struct {
		Name   string `json:"name"`
		Bio    string `json:"bio"`
		Banner string `json:"banner"`
	}
	if !utils.BindAndValidate(c, &input) {
		return
	}
	existing.Name = input.Name
	existing.Bio = input.Bio
	existing.Banner = input.Banner
	if err := database.DB.Save(&existing).Error; err != nil {
		utils.AbortWithError(c, http.StatusInternalServerError, "Failed to update model profile", err)
		return
	}
	database.DB.Preload("User").First(&existing, id)
	c.JSON(http.StatusOK, existing)
}

func DeleteModelProfile(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.AbortWithError(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}
	var profile models.ModelProfile
	if err := database.DB.First(&profile, id).Error; err != nil {
		utils.AbortWithError(c, http.StatusNotFound, "Profile not found", err)
		return
	}
	if err := database.DB.Delete(&profile).Error; err != nil {
		utils.AbortWithError(c, http.StatusInternalServerError, "Failed to delete model profile", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Model profile deleted"})
}

func GetModelProfileByUserID(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		utils.AbortWithError(c, http.StatusBadRequest, "Invalid user ID", err)
		return
	}
	var profile models.ModelProfile
	if err := database.DB.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		utils.AbortWithError(c, http.StatusNotFound, "Profile not found", err)
		return
	}
	c.JSON(http.StatusOK, profile)
}
