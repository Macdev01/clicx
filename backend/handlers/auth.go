package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"go-backend/models"
)

// GetCurrentUser returns the authenticated user from context.
func GetCurrentUser(c *gin.Context) {
	val, ok := c.Get("user")
	if !ok || val == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	user, _ := val.(*models.User)
	c.JSON(http.StatusOK, user)
}
