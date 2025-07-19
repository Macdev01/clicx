package handlers

import (
	"go-backend/database"
	"go-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PurchaseRequest struct {
	UserID uint `json:"user_id"`
	PostID uint `json:"post_id"`
}

func BuyContent(c *gin.Context) {
	var req PurchaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	var user models.User
	var post models.Post

	// Найдем пользователя и пост
	if err := database.DB.First(&user, req.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if err := database.DB.First(&post, req.PostID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Проверяем баланс
	if user.Balance < post.Price {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient funds"})
		return
	}

	// Транзакция: списываем деньги и сохраняем покупку
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		user.Balance -= post.Price
		if err := tx.Save(&user).Error; err != nil {
			return err
		}
		purchase := models.Purchase{
			UserID: user.ID,
			PostID: post.ID,
		}
		if err := tx.Create(&purchase).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Purchase failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Content purchased successfully"})
}

// GetPurchases returns a list of purchases for the current user.
// This stub implementation simply returns an empty list until the feature is
// fully implemented.
func GetPurchases(c *gin.Context) {
	c.JSON(http.StatusOK, []models.Purchase{})
}
