package repository

import (
	"go-backend/models"

	"gorm.io/gorm"
)

type OrderRepository interface {
	FindAll(limit, offset int) ([]models.Order, error)
	Create(order *models.Order) error
}

type GormOrderRepository struct {
	DB *gorm.DB
}

func (r *GormOrderRepository) FindAll(limit, offset int) ([]models.Order, error) {
	var orders []models.Order
	q := r.DB
	if limit > 0 {
		q = q.Limit(limit)
	}
	if offset > 0 {
		q = q.Offset(offset)
	}
	if err := q.Find(&orders).Error; err != nil {
		return nil, err
	}
	return orders, nil
}

func (r *GormOrderRepository) Create(order *models.Order) error {
	return r.DB.Create(order).Error
}
