package middleware

import (
	"log"
	"strings"

	"go-backend/database"
	"go-backend/models"

	"github.com/gin-gonic/gin"
)

func UserMiddlewareGin() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Set("user", nil)
			c.Next()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(401, gin.H{"error": "Authorization header must be 'Bearer {token}'"})
			return
		}

		tokenStr := parts[1]
		authClient := GetFirebaseAuth()

		token, err := authClient.VerifyIDToken(c.Request.Context(), tokenStr)
		if err != nil {
			log.Printf("❌ Firebase token verification failed: %v", err)
			c.Set("user", nil)
			c.Next()
			return
		}

		email, _ := token.Claims["email"].(string)
		name, _ := token.Claims["name"].(string)
		picture, _ := token.Claims["picture"].(string)

		if email == "" {
			log.Println("❌ Firebase token missing email")
			c.Set("user", nil)
			c.Next()
			return
		}

		// Проверка пользователя в базе
		user, err := database.GetUserByEmail(email)
		if err != nil {
			// Создаём нового
			user = &models.User{
				Name:      name,
				Email:     email,
				AvatarURL: picture,
			}
			if err := database.DB.Create(user).Error; err != nil {
				log.Printf("❌ Error creating user: %v", err)
				c.Set("user", nil)
				c.Next()
				return
			}
			log.Printf("👤 Новый пользователь: %s (%s)", name, email)
		}

		c.Set("user", user)
		c.Next()
	}
}
