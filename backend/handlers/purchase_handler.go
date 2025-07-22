package handlers

import (
	"go-backend/database"
	"go-backend/models"
	"net/http"

	"go-backend/dto"
	"go-backend/repository"
	"go-backend/services"
	"go-backend/utils"

	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PurchaseRequest struct {
	PostID uuid.UUID `json:"post_id" binding:"required" validate:"required"`
}

func BuyContent(c *gin.Context) {
	var input dto.PurchaseCreateDTO
	if err := c.ShouldBindJSON(&input); err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}
	if err := utils.ValidateStruct(input); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}
	purchaseRepo := &repository.GormPurchaseRepository{DB: database.GetDB()}
	postRepo := &repository.GormPostRepository{DB: database.GetDB()}
	service := services.NewPurchaseService(purchaseRepo, postRepo)
	val := c.MustGet("user")
	user := val.(*models.User)
	resp, err := service.BuyContent(user, &input)
	if err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusCreated, resp)
}

func GetPurchases(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")
	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)
	purchaseRepo := &repository.GormPurchaseRepository{DB: database.GetDB()}
	postRepo := &repository.GormPostRepository{DB: database.GetDB()}
	service := services.NewPurchaseService(purchaseRepo, postRepo)
	val := c.MustGet("user")
	user := val.(*models.User)
	resp, err := service.GetPurchases(user.ID, limit, offset)
	if err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, resp)
}

func CompletePurchase(c *gin.Context) {
	id := c.Param("id")

	var purchase models.Purchase
	if err := database.DB.First(&purchase, id).Error; err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": "Purchase not found"})
		return
	}

	purchase.Completed = true
	if err := database.DB.Save(&purchase).Error; err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Could not update purchase"})
		return
	}

	c.JSON(http.StatusOK, purchase)
}
