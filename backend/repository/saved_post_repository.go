package repository

import (
	"go-backend/models"

	"gorm.io/gorm"
)

type SavedPostRepository interface {
	FindByUserID(userID string, limit, offset int) ([]models.SavedPost, error)
	Create(saved *models.SavedPost) error
	Delete(saved *models.SavedPost) error
	FindByUserAndPost(userID uint, postID string) (models.SavedPost, error)
}

type GormSavedPostRepository struct {
	DB *gorm.DB
}

func (r *GormSavedPostRepository) FindByUserID(userID string, limit, offset int) ([]models.SavedPost, error) {
	var savedPosts []models.SavedPost
	q := r.DB.Where("user_id = ?", userID)
	if limit > 0 {
		q = q.Limit(limit)
	}
	if offset > 0 {
		q = q.Offset(offset)
	}
	if err := q.Find(&savedPosts).Error; err != nil {
		return nil, err
	}
	return savedPosts, nil
}

func (r *GormSavedPostRepository) Create(saved *models.SavedPost) error {
	return r.DB.Create(saved).Error
}

func (r *GormSavedPostRepository) Delete(saved *models.SavedPost) error {
	return r.DB.Delete(saved).Error
}

func (r *GormSavedPostRepository) FindByUserAndPost(userID uint, postID string) (models.SavedPost, error) {
	var saved models.SavedPost
	if err := r.DB.Where("user_id = ? AND post_id = ?", userID, postID).First(&saved).Error; err != nil {
		return saved, err
	}
	return saved, nil
}
