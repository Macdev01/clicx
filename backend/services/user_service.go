package services

import (
	"go-backend/database"
	"go-backend/models"
	"go-backend/utils"
)

func GetUsers() ([]models.User, error) {
	var users []models.User
	if err := database.DB.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func GetUserByID(id string) (models.User, error) {
	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		return user, err
	}
	return user, nil
}

func CreateUser(user *models.User) error {
	if err := database.DB.Create(user).Error; err != nil {
		return err
	}
	user.ReferralCode = utils.GenerateReferralCode(int(user.ID))
	if err := database.DB.Model(user).Update("referral_code", user.ReferralCode).Error; err != nil {
		return err
	}
	return nil
}

func UpdateUser(user *models.User) error {
	return database.DB.Save(user).Error
}

func DeleteUser(id string) error {
	return database.DB.Delete(&models.User{}, id).Error
}

func GetOrCreateUser(email, name, avatar, refCode string) (models.User, error) {
	user, err := database.GetUserByEmail(email)
	if err != nil {
		if err == database.ErrUserNotFound {
			user, err = database.CreateUser(email, name, avatar, refCode)
			if err != nil {
				return models.User{}, err
			}
		} else {
			return models.User{}, err
		}
	}
	return *user, nil
}
