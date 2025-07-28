package utils

import (
	"net/http"
	"strconv"

	"go-backend/models"

	"github.com/gin-gonic/gin"
)

// BindAndValidate binds JSON and validates using ValidateStruct. Returns false and aborts if error.
func BindAndValidate(c *gin.Context, obj interface{}) bool {
	if err := c.ShouldBindJSON(obj); err != nil {
		AbortWithError(c, http.StatusBadRequest, "Invalid input", err)
		return false
	}
	if err := ValidateStruct(obj); err != nil {
		AbortWithError(c, http.StatusBadRequest, "Validation failed", err)
		return false
	}
	return true
}

// AbortWithError aborts the request with a status, message, and logs the error.
func AbortWithError(c *gin.Context, status int, message string, err error) {
	c.Error(err)
	c.AbortWithStatusJSON(status, gin.H{"error": message, "details": err.Error()})
}

// GetCurrentUser extracts the current user from context.
func GetCurrentUser(c *gin.Context) (*models.User, bool) {
	val, exists := c.Get("user")
	if !exists || val == nil {
		return nil, false
	}
	user, ok := val.(*models.User)
	return user, ok
}

// GetPagination extracts limit and offset from query params.
func GetPagination(c *gin.Context) (limit, offset int) {
	limitStr := c.DefaultQuery("limit", "20")
	limit, _ = strconv.Atoi(limitStr)
	offsetStr := c.DefaultQuery("offset", "0")
	offset, _ = strconv.Atoi(offsetStr)
	return
}
