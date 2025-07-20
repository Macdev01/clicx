package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// CustomError позволяет задать код и HTTP-статус для бизнес-ошибок
type CustomError struct {
	Code    string
	Message string
	Status  int
}

func (e *CustomError) Error() string {
	return e.Message
}

func ErrorHandler(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				logger.Error("Panic recovered", zap.Any("error", err))

				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"status":  "error",
					"code":    "InternalServerError",
					"message": "Unexpected server error",
				})
			}
		}()

		c.Next()

		if len(c.Errors) > 0 {
			lastErr := c.Errors.Last().Err

			var status int
			var code string
			var message string

			// Если ошибка кастомная (бизнес-ошибка)
			if customErr, ok := lastErr.(*CustomError); ok {
				status = customErr.Status
				code = customErr.Code
				message = customErr.Message
			} else {
				// Системная ошибка
				status = http.StatusInternalServerError
				code = "InternalError"
				message = lastErr.Error()
			}

			logger.Error("API Error",
				zap.String("path", c.Request.URL.Path),
				zap.String("method", c.Request.Method),
				zap.Int("status", status),
				zap.String("code", code),
				zap.String("message", message),
				zap.String("client_ip", c.ClientIP()),
			)

			c.AbortWithStatusJSON(status, gin.H{
				"status":  "error",
				"code":    code,
				"message": message,
			})
		}
	}
}
