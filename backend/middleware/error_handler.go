package middleware

import (
	"net/http"

	"go-backend/logging"

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
				logger.Error("Panic recovered",
					zap.Any("error", err),
					zap.String("request_id", logging.GetRequestID(c)),
					zap.String("endpoint", c.FullPath()),
					zap.String("method", c.Request.Method),
				)
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

			userID := ""
			if u, exists := c.Get("user"); exists {
				if user, ok := u.(interface{ GetID() uint }); ok {
					userID = string(rune(user.GetID()))
				}
			}

			logger.Error("API Error",
				zap.String("request_id", logging.GetRequestID(c)),
				zap.String("endpoint", c.FullPath()),
				zap.String("method", c.Request.Method),
				zap.Int("status", status),
				zap.String("code", code),
				zap.String("message", message),
				zap.String("client_ip", c.ClientIP()),
				zap.String("user_id", userID),
			)

			c.AbortWithStatusJSON(status, gin.H{
				"status":  "error",
				"code":    code,
				"message": message,
			})
		}
	}
}
