package repository

import (
	"go-backend/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ModelProfileRepository interface {
	FindAll(limit, offset int) ([]models.ModelProfile, error)
	Create(profile *models.ModelProfile) error
	FindByUserID(userID uuid.UUID) (models.ModelProfile, error)
}

type GormModelProfileRepository struct {
	DB *gorm.DB
}

func (r *GormModelProfileRepository) FindAll(limit, offset int) ([]models.ModelProfile, error) {
	var profiles []models.ModelProfile
	q := r.DB.Preload("User")
	if limit > 0 {
		q = q.Limit(limit)
	}
	if offset > 0 {
		q = q.Offset(offset)
	}
	if err := q.Find(&profiles).Error; err != nil {
		return nil, err
	}
	return profiles, nil
}

func (r *GormModelProfileRepository) Create(profile *models.ModelProfile) error {
	return r.DB.Create(profile).Error
}

func (r *GormModelProfileRepository) FindByUserID(userID uuid.UUID) (models.ModelProfile, error) {
	var profile models.ModelProfile
	if err := r.DB.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		return profile, err
	}
	return profile, nil
}
