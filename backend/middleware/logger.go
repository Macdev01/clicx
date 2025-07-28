package middleware

import (
	"time"

	"go-backend/logging"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// LoggerMiddleware логирует все HTTP-запросы
func LoggerMiddleware(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next() // Выполняем хендлеры
		latency := time.Since(start)
		status := c.Writer.Status()
		requestID := logging.GetRequestID(c)
		userID := ""
		if u, exists := c.Get("user"); exists {
			if user, ok := u.(interface{ GetID() uint }); ok {
				userID = string(rune(user.GetID()))
			}
		}
		logger.Info("HTTP Request",
			zap.String("request_id", requestID),
			zap.String("endpoint", c.FullPath()),
			zap.String("method", c.Request.Method),
			zap.Int("status", status),
			zap.Float64("duration_ms", float64(latency.Microseconds())/1000.0),
			zap.String("client_ip", c.ClientIP()),
			zap.String("user_id", userID),
		)
	}
}
