package repository

import (
	"errors"
	"go-backend/models"
	"go-backend/utils"
	"strings"

	"gorm.io/gorm"
)

var ErrUserNotFound = errors.New("user not found")

type UserRepository interface {
	FindAll(limit, offset int) ([]models.User, error)
	FindByID(id string) (models.User, error)
	FindByEmail(email string) (models.User, error)
	Create(user *models.User) error
	Update(user *models.User) error
	Delete(id string) error
	CreateUser(email, avatar, refCode string) (*models.User, error)
}

type GormUserRepository struct {
	DB *gorm.DB
}

func (r *GormUserRepository) FindAll(limit, offset int) ([]models.User, error) {
	var users []models.User
	q := r.DB
	if limit > 0 {
		q = q.Limit(limit)
	}
	if offset > 0 {
		q = q.Offset(offset)
	}
	if err := q.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (r *GormUserRepository) FindByID(id string) (models.User, error) {
	var user models.User
	if err := r.DB.First(&user, id).Error; err != nil {
		return user, err
	}
	return user, nil
}

func (r *GormUserRepository) FindByEmail(email string) (models.User, error) {
	var user models.User
	if err := r.DB.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return user, ErrUserNotFound
		}
		return user, err
	}
	return user, nil
}

func (r *GormUserRepository) Create(user *models.User) error {
	return r.DB.Create(user).Error
}

func (r *GormUserRepository) Update(user *models.User) error {
	return r.DB.Save(user).Error
}

func (r *GormUserRepository) Delete(id string) error {
	return r.DB.Delete(&models.User{}, id).Error
}

func (r *GormUserRepository) CreateUser(email, avatar, refCode string) (*models.User, error) {
	code := utils.GenerateReferralCode(8)
	user := &models.User{
		Email:        email,
		AvatarURL:    avatar,
		Nickname:     generateNickname(email),
		ReferralCode: &code,
	}
	if err := r.DB.Create(user).Error; err != nil {
		return nil, err
	}
	if refCode != "" {
		var inviter models.User
		if err := r.DB.Where("referral_code = ?", refCode).First(&inviter).Error; err == nil {
			inviter.Balance += 1
			r.DB.Save(&inviter)
		}
	}
	return user, nil
}

func generateNickname(email string) string {
	return "user_" + strings.Split(email, "@")[0]
}
