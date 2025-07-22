package repository

import (
	"go-backend/models"

	"gorm.io/gorm"
)

type PostRepository interface {
	FindAll(limit, offset int) ([]models.Post, error)
	FindByID(id string) (models.Post, error)
	Create(post *models.Post) error
}

type GormPostRepository struct {
	DB *gorm.DB
}

func (r *GormPostRepository) FindAll(limit, offset int) ([]models.Post, error) {
	var posts []models.Post
	q := r.DB.Preload("User").Preload("Media").Preload("ModelProfile")
	if limit > 0 {
		q = q.Limit(limit)
	}
	if offset > 0 {
		q = q.Offset(offset)
	}
	if err := q.Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

func (r *GormPostRepository) FindByID(id string) (models.Post, error) {
	var post models.Post
	if err := r.DB.First(&post, "id = ?", id).Error; err != nil {
		return post, err
	}
	return post, nil
}

func (r *GormPostRepository) Create(post *models.Post) error {
	return r.DB.Create(post).Error
}
