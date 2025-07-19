package tests

import (
	"testing"

	"go-backend/config"
	"go-backend/database"
	"go-backend/models"
	"go-backend/routes"

	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func SetupRouter(t *testing.T) *gin.Engine {
	t.Helper()
	gin.SetMode(gin.TestMode)

	// in-memory sqlite DB
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	database.DB = db
	if err := database.MigrateAll(); err != nil {
		t.Fatalf("failed to migrate: %v", err)
	}

	// create default admin user so UserMiddlewareGin can find it
	db.Create(&models.User{Email: "admin@example.com", Name: "admin", IsAdmin: true})

	// minimal config
	config.AppConfig = &config.Config{}

	r := gin.Default()
	routes.InitRoutes(r)
	return r
}
