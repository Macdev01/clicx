package handlers

import (
	"go-backend/database"
	"go-backend/models"
	"go-backend/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func CompletePurchase(c *gin.Context) {
	// Получаем ID пользователя
	userIDStr := c.Param("id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Находим пользователя
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Получаем сумму покупки
	var input struct {
		Amount float64 `json:"amount"`
	}
	if err := c.ShouldBindJSON(&input); err != nil || input.Amount <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid amount"})
		return
	}

	// Начисляем бонусы 1-2-3 уровням
	services.DistributeReferralBonus(user, input.Amount)

	c.JSON(http.StatusOK, gin.H{
		"message": "Purchase complete, bonuses distributed",
		"user_id": user.ID,
		"amount":  input.Amount,
	})
}
