package handlers

import (
	"mvp-go-backend/database"
	"mvp-go-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetAdmins(c *gin.Context) {
	var admins []models.Admin
	if err := database.DB.Find(&admins).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// // Версия с DTO
	// var dtoList []models.AdminResponseDTO
	// for _, a := range admins {
	//     dtoList = append(dtoList, models.ToAdminDTO(a))
	// }
	// c.JSON(http.StatusOK, dtoList)

	c.JSON(http.StatusOK, admins)
}

func GetAdminByID(c *gin.Context) {
	id := c.Param("id")
	var admin models.Admin
	if err := database.DB.First(&admin, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
		return
	}
	c.JSON(http.StatusOK, admin)
}

func CreateAdmin(c *gin.Context) {
	var admin models.Admin
	if err := c.ShouldBindJSON(&admin); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := database.DB.Create(&admin).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, admin)
}

func UpdateAdmin(c *gin.Context) {
	id := c.Param("id")
	var admin models.Admin
	if err := database.DB.First(&admin, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
		return
	}
	if err := c.ShouldBindJSON(&admin); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := database.DB.Save(&admin).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, admin)
}

func DeleteAdmin(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Admin{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Admin deleted"})
}
