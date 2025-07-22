package middleware

import (
	"net/http"

	"go-backend/models"

	"github.com/gin-gonic/gin"
)

// AdminMiddleware ensures the user is an admin.
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		val, exists := c.Get("user")
		if !exists || val == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		user, ok := val.(*models.User)
		if !ok || !user.IsAdmin {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "admin only"})
			return
		}
		c.Next()
	}
}
