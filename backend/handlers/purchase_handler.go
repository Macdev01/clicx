package handlers

import (
	"errors"
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

type PurchaseRequest struct {
	PostID uuid.UUID `json:"post_id" binding:"required" validate:"required"`
}

func BuyContent(c *gin.Context) {
	var input dto.PurchaseCreateDTO
	if !utils.BindAndValidate(c, &input) {
		return
	}
	purchaseRepo := &repository.GormPurchaseRepository{DB: database.GetDB()}
	postRepo := &repository.GormPostRepository{DB: database.GetDB()}
	service := services.NewPurchaseService(purchaseRepo, postRepo)
	user, ok := utils.GetCurrentUser(c)
	if !ok {
		utils.AbortWithError(c, http.StatusUnauthorized, "Unauthorized", errors.New("user not found in context"))
		return
	}
	resp, err := service.BuyContent(user, &input)
	if err != nil {
		utils.AbortWithError(c, http.StatusInternalServerError, "Failed to buy content", err)
		return
	}
	c.JSON(http.StatusCreated, resp)
}

func GetPurchases(c *gin.Context) {
	limit, offset := utils.GetPagination(c)
	purchaseRepo := &repository.GormPurchaseRepository{DB: database.GetDB()}
	postRepo := &repository.GormPostRepository{DB: database.GetDB()}
	service := services.NewPurchaseService(purchaseRepo, postRepo)
	user, ok := utils.GetCurrentUser(c)
	if !ok {
		utils.AbortWithError(c, http.StatusUnauthorized, "Unauthorized", errors.New("user not found in context"))
		return
	}
	resp, err := service.GetPurchases(user.ID, limit, offset)
	if err != nil {
		utils.AbortWithError(c, http.StatusInternalServerError, "Failed to get purchases", err)
		return
	}
	c.JSON(http.StatusOK, resp)
}

func CompletePurchase(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid purchase ID"})
		return
	}
	var purchase models.Purchase
	if err := database.DB.First(&purchase, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Purchase not found"})
		return
	}
	purchase.Completed = true
	if err := database.DB.Save(&purchase).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to complete purchase"})
		return
	}
	c.JSON(http.StatusOK, purchase)
}
