package repository

import (
	"go-backend/models"

	"gorm.io/gorm"
)

type VideoRepository interface {
	CreateMedia(media *models.Media) error
	GetMediaByID(id uint) (models.Media, error)
	GetMediaByPostID(postID string) ([]models.Media, error)
	GetMediaByUserID(userID uint) ([]models.Media, error)
	DeleteMedia(media *models.Media) error
}

type GormVideoRepository struct {
	DB *gorm.DB
}

func (r *GormVideoRepository) CreateMedia(media *models.Media) error {
	return r.DB.Create(media).Error
}

func (r *GormVideoRepository) GetMediaByID(id uint) (models.Media, error) {
	var media models.Media
	if err := r.DB.First(&media, id).Error; err != nil {
		return media, err
	}
	return media, nil
}

func (r *GormVideoRepository) GetMediaByPostID(postID string) ([]models.Media, error) {
	var media []models.Media
	if err := r.DB.Where("post_id = ?", postID).Find(&media).Error; err != nil {
		return nil, err
	}
	return media, nil
}

func (r *GormVideoRepository) GetMediaByUserID(userID uint) ([]models.Media, error) {
	var media []models.Media
	if err := r.DB.Joins("JOIN posts ON posts.id = media.post_id").Where("posts.user_id = ?", userID).Find(&media).Error; err != nil {
		return nil, err
	}
	return media, nil
}

func (r *GormVideoRepository) DeleteMedia(media *models.Media) error {
	return r.DB.Delete(media).Error
}
