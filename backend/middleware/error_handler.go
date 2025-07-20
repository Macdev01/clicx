package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func ErrorHandler(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				logger.Error("panic recovered", zap.Any("error", err))
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error": gin.H{
						"code":    "InternalServerError",
						"message": "Unexpected server error",
					},
				})
			}
		}()

		c.Next()

		if len(c.Errors) > 0 {
			lastErr := c.Errors.Last()
			status := c.Writer.Status()
			if status == http.StatusOK {
				status = http.StatusInternalServerError
			}

			logger.Error("request error", zap.Error(lastErr.Err))
			c.AbortWithStatusJSON(status, gin.H{
				"error": gin.H{
					"code":    "InternalError",
					"message": lastErr.Error(),
				},
			})
		}
	}
}
