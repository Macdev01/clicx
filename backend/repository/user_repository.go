package repository

import (
	"errors"
	"go-backend/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

var ErrUserNotFound = errors.New("user not found")

type UserRepository interface {
	FindAll(limit, offset int) ([]models.User, error)
	FindByID(id uuid.UUID) (models.User, error)
	FindByEmail(email string) (models.User, error)
	Create(user *models.User) error
	Update(user *models.User) error
	Delete(id uuid.UUID) error
	CreateUser(email, avatar, password, refCode string) (*models.User, error)
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

func (r *GormUserRepository) FindByID(id uuid.UUID) (models.User, error) {
	var user models.User
	if err := r.DB.First(&user, "id = ?", id).Error; err != nil {
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

func (r *GormUserRepository) Delete(id uuid.UUID) error {
	return r.DB.Delete(&models.User{}, "id = ?", id).Error
}

func (r *GormUserRepository) CreateUser(email, avatar, password, refCode string) (*models.User, error) {
	user := &models.User{
		ID:        uuid.New(),
		Email:     email,
		AvatarURL: avatar,
		Password:  password,
	}
	if err := r.DB.Create(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}
