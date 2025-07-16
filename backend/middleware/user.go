package middleware

import (
	"log"

	"go-backend/database"
	"go-backend/models"

	"github.com/gin-gonic/gin"
)

func UserMiddlewareGin() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Проверка токена (Firebase) убрана для тестов, можно вернуть позже
		log.Println("⚠ Dev mode: принудительно используем админа")

		// Жёстко ищем админа в базе
		var admin models.User
		if err := database.DB.Where("is_admin = ?", true).First(&admin).Error; err == nil {
			c.Set("user", &admin)
			log.Println("✅ Админ найден:", admin.Email)
		} else {
			log.Println("❌ Админ не найден, попробуйте создать вручную")
			c.Set("user", nil)
		}

		c.Next()
	}
}
