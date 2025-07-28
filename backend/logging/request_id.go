package logging

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const RequestIDKey = "request_id"

// RequestIDMiddleware generates a request_id for each request and adds it to context and response header
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		reqID := c.GetHeader("X-Request-ID")
		if reqID == "" {
			reqID = uuid.New().String()
		}
		c.Set(RequestIDKey, reqID)
		c.Writer.Header().Set("X-Request-ID", reqID)
		c.Next()
	}
}

// GetRequestID returns the request_id from context
func GetRequestID(c *gin.Context) string {
	if v, exists := c.Get(RequestIDKey); exists {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}
