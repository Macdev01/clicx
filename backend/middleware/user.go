package middleware

import (
	"go-backend/models"

	"github.com/gin-gonic/gin"
)

func UserMiddlewareGin() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Временно подставляем тестового пользователя
		testUser := models.User{
			ID:      1,
			Name:    "Admin Test",
			Email:   "admin@test.com",
			IsAdmin: true, // даём права админа для тестов
		}

		// Записываем в контекст
		c.Set("user", testUser)

		// Продолжаем выполнение запроса
		c.Next()
	}
}
