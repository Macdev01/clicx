package repository

import (
	"go-backend/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PurchaseRepository interface {
	FindByUserID(userID uuid.UUID, limit, offset int) ([]models.Purchase, error)
	Create(purchase *models.Purchase) error
	FindByUserAndPost(userID uuid.UUID, postID uuid.UUID) (models.Purchase, error)
}

type GormPurchaseRepository struct {
	DB *gorm.DB
}

func (r *GormPurchaseRepository) FindByUserID(userID uuid.UUID, limit, offset int) ([]models.Purchase, error) {
	var purchases []models.Purchase
	q := r.DB.Where("user_id = ?", userID)
	if limit > 0 {
		q = q.Limit(limit)
	}
	if offset > 0 {
		q = q.Offset(offset)
	}
	if err := q.Find(&purchases).Error; err != nil {
		return nil, err
	}
	return purchases, nil
}

func (r *GormPurchaseRepository) Create(purchase *models.Purchase) error {
	return r.DB.Create(purchase).Error
}

func (r *GormPurchaseRepository) FindByUserAndPost(userID uuid.UUID, postID uuid.UUID) (models.Purchase, error) {
	var purchase models.Purchase
	if err := r.DB.Where("user_id = ? AND post_id = ?", userID, postID).First(&purchase).Error; err != nil {
		return purchase, err
	}
	return purchase, nil
}
