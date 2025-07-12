package handlers

import (
	"go-backend/database"
	"go-backend/models"
	"go-backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreatePlisioInvoice(c *gin.Context) {
	var req services.InvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
		return
	}

	client := services.NewPlisioClient()
	resp, err := client.CreateInvoice(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"invoice_url": resp.Data.InvoiceURL,
		"txn_id":      resp.Data.TxnID,
	})
}

func PlisioCallback(c *gin.Context) {
	var payload map[string]string
	if err := c.ShouldBind(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	if !services.ValidatePlisioSignature(payload) {
		c.JSON(http.StatusForbidden, gin.H{"error": "invalid signature"})
		return
	}

	txnID := payload["txn_id"]
	orderNumber := payload["order_number"]
	amount := payload["amount"]
	status := payload["status"]

	// Проверка на дубликат
	var existing models.Payment
	if err := database.DB.Where("txn_id = ?", txnID).First(&existing).Error; err == nil {
		c.JSON(http.StatusOK, gin.H{"message": "Payment already processed", "txn_id": txnID})
		return
	}

	// Сохраняем в базу
	payment := models.Payment{
		TxnID:       txnID,
		OrderNumber: orderNumber,
		Amount:      amount,
		Status:      status,
	}

	if err := database.DB.Create(&payment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save payment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"txn_id":  txnID,
		"order":   orderNumber,
		"amount":  amount,
		"message": "Payment saved",
	})
}
