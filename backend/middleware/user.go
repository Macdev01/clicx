package middleware

import (
	"context"
	"strings"

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
		name, _ := decoded.Claims["name"].(string)
		avatar, _ := decoded.Claims["picture"].(string)
		refCode := c.GetHeader("X-Referral-Code")

		user, err := services.GetOrCreateUser(email, name, avatar, refCode)
		if err != nil {
			logger.Error("failed to load user", zap.Error(err))
			c.Next()
			return
		}

		c.Set("user", user)
		c.Next()
	}
}
