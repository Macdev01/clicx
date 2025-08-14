package middleware

import (
	"context"
	"net/http"
	"strings"

	"go-backend/database"
	"go-backend/repository"
	"go-backend/services"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// UserMiddleware validates Firebase token and loads user into context.
func UserMiddleware(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		client := GetFirebaseAuth()
		decoded, err := client.VerifyIDToken(context.Background(), token)
		if err != nil {
			logger.Warn("invalid firebase token", zap.Error(err))
			c.Next()
			return
		}

		email, _ := decoded.Claims["email"].(string)
		avatar, _ := decoded.Claims["picture"].(string)
		refCode := c.GetHeader("X-Referral-Code")

		userRepo := &repository.GormUserRepository{DB: database.GetDB()}
		userService := services.NewUserService(userRepo)
		user, err := userService.GetOrCreateUser(email, avatar, "changeme123", refCode)
		if err != nil {
			logger.Error("Failed to get or create user", zap.Error(err))
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.Set("user", user)
		c.Next()
	}
}

// RequireUser enforces that a user is present in the context (set by UserMiddleware).
func RequireUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		val, exists := c.Get("user")
		if !exists || val == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		c.Next()
	}
}
