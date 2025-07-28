package handlers

import (
	"go-backend/database"
	"go-backend/models"
	"net/http"

	"go-backend/dto"
	"go-backend/repository"
	"go-backend/services"
	"go-backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetOrders(c *gin.Context) {
	limit, offset := utils.GetPagination(c)
	orderRepo := &repository.GormOrderRepository{DB: database.GetDB()}
	service := services.NewOrderService(orderRepo)
	resp, err := service.GetOrders(limit, offset)
	if err != nil {
		utils.AbortWithError(c, http.StatusInternalServerError, "Failed to get orders", err)
		return
	}
	c.JSON(http.StatusOK, resp)
}

func GetOrderByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.AbortWithError(c, http.StatusBadRequest, "Invalid order ID", err)
		return
	}
	var order models.Order
	if err := database.DB.First(&order, "id = ?", id).Error; err != nil {
		utils.AbortWithError(c, http.StatusNotFound, "Order not found", err)
		return
	}
	c.JSON(http.StatusOK, order)
}

func CreateOrder(c *gin.Context) {
	var input dto.OrderCreateDTO
	if !utils.BindAndValidate(c, &input) {
		return
	}
	orderRepo := &repository.GormOrderRepository{DB: database.GetDB()}
	service := services.NewOrderService(orderRepo)
	resp, err := service.CreateOrder(&input)
	if err != nil {
		utils.AbortWithError(c, http.StatusInternalServerError, "Failed to create order", err)
		return
	}
	c.JSON(http.StatusCreated, resp)
}

func UpdateOrder(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.AbortWithError(c, http.StatusBadRequest, "Invalid order ID", err)
		return
	}
	var order models.Order
	if err := database.DB.First(&order, "id = ?", id).Error; err != nil {
		utils.AbortWithError(c, http.StatusNotFound, "Order not found", err)
		return
	}
	if !utils.BindAndValidate(c, &order) {
		return
	}
	if err := database.DB.Save(&order).Error; err != nil {
		utils.AbortWithError(c, http.StatusInternalServerError, "Failed to update order", err)
		return
	}
	c.JSON(http.StatusOK, order)
}

func DeleteOrder(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.AbortWithError(c, http.StatusBadRequest, "Invalid order ID", err)
		return
	}
	if err := database.DB.Delete(&models.Order{}, "id = ?", id).Error; err != nil {
		utils.AbortWithError(c, http.StatusInternalServerError, "Failed to delete order", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Order deleted"})
}
