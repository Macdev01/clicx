package middleware

import (
	"errors"
	"log"
	"strings"

	"mvp-go-backend/database"

	"github.com/gin-gonic/gin"
)

// UserMiddlewareGin извлекает Firebase токен и пользователя
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

		// Извлечение полей
		email, _ := token.Claims["email"].(string)
		name, _ := token.Claims["name"].(string)
		picture, _ := token.Claims["picture"].(string)

		if email == "" {
			log.Println("❌ Firebase token missing email")
			c.Set("user", nil)
			c.Next()
			return
		}

		user, err := database.GetUserByEmail(email)
		if err != nil {
			if errors.Is(err, database.ErrUserNotFound) {
				user, err = database.CreateUser(email, name, picture)
				if err != nil {
					log.Printf("❌ Error creating user: %v", err)
					c.Set("user", nil)
					c.Next()
					return
				}
				log.Printf("👤 Новый пользователь создан: %s (%s)", name, email)
			} else {
				log.Printf("❌ Error fetching user: %v", err)
				c.Set("user", nil)
				c.Next()
				return
			}
		}

		c.Set("user", user)
		c.Next()
	}
}
