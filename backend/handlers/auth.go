package handlers

import (
	"go-backend/database"
	"go-backend/models"
	"go-backend/utils"

	"github.com/gin-gonic/gin"
)

func Register(c *gin.Context) {
	var input struct {
		Email        string `json:"email"`
		Nickname     string `json:"nickname"`
		Password     string `json:"password"`
		ReferralCode string `json:"referral_code"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	user := models.User{
		Email:    input.Email,
		Nickname: input.Nickname,
		Password: input.Password, // хэшируй!
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Генерация referral_code
	code := utils.GenerateReferralCode(int(user.ID))
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
