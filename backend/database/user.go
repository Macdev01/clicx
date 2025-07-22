package database

import (
	"errors"
	"strings"

	"go-backend/models"
	"go-backend/utils"

	"gorm.io/gorm"
)

var ErrUserNotFound = errors.New("user not found")

func GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := DB.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func CreateUser(email string, avatar string, refCode string) (*models.User, error) {
	code := utils.GenerateReferralCode(8)
	// For demo, use a default password or generate one, but hash it
	defaultPassword := "changeme123"
	hashedPassword, _ := utils.HashPassword(defaultPassword)
	user := &models.User{
		Email:        email,
		AvatarURL:    avatar,
		Nickname:     generateNickname(email),
		ReferralCode: &code,
		Password:     hashedPassword,
	}
	if err := DB.Create(user).Error; err != nil {
		return nil, err
	}
	if refCode != "" {
		var inviter models.User
		if err := DB.Where("referral_code = ?", refCode).First(&inviter).Error; err == nil {
			ref := models.Referral{UserID: inviter.ID, ReferralCode: refCode, InvitedUserID: user.ID}
			DB.Create(&ref)
			inviter.Balance += 1
			DB.Save(&inviter)
		}
	}
	return user, nil
}

func generateNickname(email string) string {
	return "user_" + strings.Split(email, "@")[0]
}
