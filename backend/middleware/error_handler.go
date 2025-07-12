package middleware

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("Panic recovered: %v", err)

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

			// Определим статус
			status := c.Writer.Status()
			if status == http.StatusOK {
				status = http.StatusInternalServerError
			}

			log.Printf("API Error: %v", lastErr.Err)

			c.AbortWithStatusJSON(status, gin.H{
				"error": gin.H{
					"code":    "InternalError",
					"message": lastErr.Error(),
				},
			})
		}
	}
}
