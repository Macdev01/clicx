package middleware

import (
	"context"
	"net/http"
	"strings"

	"go-backend/database"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware checks Firebase JWT and loads the user from the database.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing Authorization header"})
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		client := GetFirebaseAuth()
		decoded, err := client.VerifyIDToken(context.Background(), token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		email, _ := decoded.Claims["email"].(string)
		name, _ := decoded.Claims["name"].(string)
		avatar, _ := decoded.Claims["picture"].(string)
		refCode := c.GetHeader("X-Referral-Code")

		user, err := database.GetUserByEmail(email)
		if err != nil {
			if err == database.ErrUserNotFound {
				user, err = database.CreateUser(email, name, avatar, refCode)
				if err != nil {
					c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
					return
				}
			} else {
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "database error"})
				return
			}
		}

		c.Set("user", user)
		c.Next()
	}
}
