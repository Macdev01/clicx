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
	PostID uuid.UUID `json:"post_id" binding:"required"`
}

func BuyContent(c *gin.Context) {
	var req PurchaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Получаем user из контекста (предполагаем, что в middleware добавлен user)
	val := c.MustGet("user")
	user := val.(*models.User)

	var post models.Post
	if err := database.DB.First(&post, "id = ?", req.PostID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Проверка, что контент премиум
	if !post.IsPremium {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This content is free"})
		return
	}

	// Проверка на повторную покупку
	var existingPurchase models.Purchase
	if err := database.DB.First(&existingPurchase, "user_id = ? AND post_id = ?", user.ID, post.ID).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Content already purchased"})
		return
	}

	// Проверка баланса
	if user.Balance < post.Price {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient funds"})
		return
	}

	// Транзакция
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		// Списываем деньги
		user.Balance -= post.Price
		if err := tx.Save(&user).Error; err != nil {
			return err
		}

		// Создаём запись о покупке
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

// GetPurchases возвращает список купленных постов для текущего пользователя
func GetPurchases(c *gin.Context) {
	val := c.MustGet("user")
	user := val.(*models.User)

	var purchases []models.Purchase
	if err := database.DB.Where("user_id = ?", user.ID).Find(&purchases).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load purchases"})
		return
	}

	// Если нужно вернуть полные посты
	var posts []models.Post
	postIDs := make([]string, 0, len(purchases))
	for _, p := range purchases {
		postIDs = append(postIDs, p.PostID.String())
	}

	if len(postIDs) > 0 {
		if err := database.DB.Preload("Media").Preload("ModelProfile").Find(&posts, "id IN ?", postIDs).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load posts"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"purchases": posts,
	})
}

func CompletePurchase(c *gin.Context) {
	id := c.Param("id")

	var purchase models.Purchase
	if err := database.DB.First(&purchase, id).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusNotFound)
		return
	}

	purchase.Completed = true
	if err := database.DB.Save(&purchase).Error; err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	c.JSON(http.StatusOK, purchase)
}
