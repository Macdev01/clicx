package handlers

import (
	"go-backend/database"
	"go-backend/seed"
	"net/http"

	"github.com/gin-gonic/gin"
)

func MigrateHandler(c *gin.Context) {
	if err := database.MigrateAll(); err != nil {
		c.Error(err) // передаём в middleware ErrorHandler()
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Миграция выполнена"})
}

func SeedHandler(c *gin.Context) {
	if err := seed.SeedData(); err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Seed завершён"})
}
