package database

import (
	"errors"
	"strings"

	"mvp-go-backend/models"

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

func CreateUser(email string, name string, avatar string) (*models.User, error) {
	user := &models.User{
		Email:     email,
		Name:      name,
		AvatarURL: avatar,
		Nickname:  generateNickname(email),
	}
	if err := DB.Create(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func generateNickname(email string) string {
	return "user_" + strings.Split(email, "@")[0]
}
