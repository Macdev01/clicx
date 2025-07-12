package handlers

import (
	"go-backend/database"
	"go-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetAdmins(c *gin.Context) {
	var admins []models.Admin
	if err := database.DB.Find(&admins).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, admins)
}

func GetAdminByID(c *gin.Context) {
	id := c.Param("id")
	var admin models.Admin
	if err := database.DB.First(&admin, id).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusNotFound)
		return
	}
	c.JSON(http.StatusOK, admin)
}

func CreateAdmin(c *gin.Context) {
	var admin models.Admin
	if err := c.ShouldBindJSON(&admin); err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}
	if err := database.DB.Create(&admin).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusCreated, admin)
}

func UpdateAdmin(c *gin.Context) {
	id := c.Param("id")
	var admin models.Admin
	if err := database.DB.First(&admin, id).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusNotFound)
		return
	}
	if err := c.ShouldBindJSON(&admin); err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}
	if err := database.DB.Save(&admin).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, admin)
}

func DeleteAdmin(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Admin{}, id).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Admin deleted"})
}
