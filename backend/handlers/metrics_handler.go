package handlers

import (
	"net/http"

	"go-backend/database"
	"go-backend/models"

	"github.com/gin-gonic/gin"
)

// MetricsResponse represents basic counters for admin dashboard.
type MetricsResponse struct {
	Users  int64 `json:"users"`
	Posts  int64 `json:"posts"`
	Orders int64 `json:"orders"`
}

// GetMetrics godoc
// @Summary      Get platform metrics
// @Description  Returns counters used in admin dashboard
// @Tags         metrics
// @Produce      json
// @Success      200 {object} MetricsResponse
// @Router       /metrics [get]
func GetMetrics(c *gin.Context) {
	var users, posts, orders int64
	database.DB.Model(&models.User{}).Count(&users)
	database.DB.Model(&models.Post{}).Count(&posts)
	database.DB.Model(&models.Order{}).Count(&orders)

	c.JSON(http.StatusOK, MetricsResponse{Users: users, Posts: posts, Orders: orders})
}
