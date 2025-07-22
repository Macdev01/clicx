package handlers

import (
	"go-backend/database"
	"go-backend/models"
	"go-backend/utils"

	"github.com/gin-gonic/gin"
)

func Register(c *gin.Context) {
	var input struct {
		Email        string `json:"email" validate:"required,email"`
		Nickname     string `json:"nickname" validate:"required,min=3,max=32"`
		Password     string `json:"password" validate:"required,min=8"`
		ReferralCode string `json:"referral_code"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": "Invalid input"})
		return
	}
	if err := utils.ValidateStruct(input); err != nil {
		c.JSON(400, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}

	// Hash the password
	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		c.JSON(500, gin.H{"error": "Internal server error"})
		return
	}

	user := models.User{
		Email:    input.Email,
		Nickname: input.Nickname,
		Password: hashedPassword,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(500, gin.H{"error": "Could not create user"})
		return
	}

	// Генерация referral_code
	code := utils.GenerateReferralCode(8)
	user.ReferralCode = &code

	// Проверка реферального кода
	if input.ReferralCode != "" {
		var referrer models.User
		if err := database.DB.Where("referral_code = ?", input.ReferralCode).First(&referrer).Error; err == nil {
			user.ReferredBy = &referrer.ID
		}
	}

	database.DB.Save(&user)
	c.JSON(200, gin.H{"message": "User registered", "user": user})
}
