package handlers

import (
	"go-backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var imageService *services.ImageService

func InitImageHandler(service *services.ImageService) {
	imageService = service
}

// POST /images/upload
func UploadImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		imageService.Logger.Error("No image file in request")
		c.JSON(http.StatusBadRequest, gin.H{"error": "No image file provided"})
		return
	}
	image, err := imageService.UploadImage(file)
	if err != nil {
		imageService.Logger.Error("Image upload failed")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, image)
}

// GET /images/:id
func GetImage(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		imageService.Logger.Error("Invalid image id")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image id"})
		return
	}
	image, err := imageService.GetImage(id)
	if err != nil {
		imageService.Logger.Error("Image not found")
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}
	c.JSON(http.StatusOK, image)
}

// DELETE /images/:id
func DeleteImage(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		imageService.Logger.Error("Invalid image id")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image id"})
		return
	}
	if err := imageService.DeleteImage(id); err != nil {
		imageService.Logger.Error("Image delete failed")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Image deleted"})
}
