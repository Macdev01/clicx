package handlers

import (
	"go-backend/database"
	"go-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PurchaseRequest struct {
	UserID uint   `json:"user_id"`
	PostID string `json:"post_id"`
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

	postUUID, err := uuid.Parse(req.PostID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post_id"})
		return
	}

	if err := database.DB.First(&post, "id = ?", postUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Транзакция: сохраняем покупку и при необходимости списываем баланс.
	err = database.DB.Transaction(func(tx *gorm.DB) error {
		if user.Balance > 0 {
			user.Balance -= 1 // Placeholder price
			if err := tx.Save(&user).Error; err != nil {
				return err
			}
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

// GetPurchases returns a list of purchases.
func GetPurchases(c *gin.Context) {
	var purchases []models.Purchase
	if err := database.DB.Find(&purchases).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, purchases)
}
