package handlers

import (
	"mvp-go-backend/database"
	"net/http"

	"mvp-go-backend/seed"

	"github.com/gin-gonic/gin"
)

// GET /migrate
func MigrateHandler(c *gin.Context) {
	database.MigrateAll()
	c.JSON(http.StatusOK, gin.H{"message": "Миграция выполнена"})
}

func SeedHandler(c *gin.Context) {
	// Uncomment the following line if the seed package and SeedData function exist
	seed.SeedData()
	c.JSON(http.StatusOK, gin.H{"message": "Seed завершён"})
}
