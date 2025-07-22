package services

import (
	"go-backend/dto"
	"go-backend/models"
	"go-backend/repository"

	"gorm.io/gorm"
)

type PurchaseService struct {
	Repo     repository.PurchaseRepository
	PostRepo repository.PostRepository
}

func NewPurchaseService(repo repository.PurchaseRepository, postRepo repository.PostRepository) *PurchaseService {
	return &PurchaseService{Repo: repo, PostRepo: postRepo}
}

func (s *PurchaseService) GetPurchases(userID uint, limit, offset int) ([]dto.PurchaseResponseDTO, error) {
	purchases, err := s.Repo.FindByUserID(userID, limit, offset)
	if err != nil {
		return nil, err
	}
	resp := make([]dto.PurchaseResponseDTO, 0, len(purchases))
	for _, p := range purchases {
		resp = append(resp, dto.PurchaseResponseDTO{
			ID:        p.ID,
			UserID:    p.UserID,
			PostID:    p.PostID,
			Completed: p.Completed,
		})
	}
	return resp, nil
}

func (s *PurchaseService) BuyContent(user *models.User, input *dto.PurchaseCreateDTO) (dto.PurchaseResponseDTO, error) {
	post, err := s.PostRepo.FindByID(input.PostID.String())
	if err != nil {
		return dto.PurchaseResponseDTO{}, err
	}
	if !post.IsPremium {
		return dto.PurchaseResponseDTO{}, gorm.ErrInvalidTransaction
	}
	_, err = s.Repo.FindByUserAndPost(user.ID, input.PostID.String())
	if err == nil {
		return dto.PurchaseResponseDTO{}, gorm.ErrInvalidTransaction
	}
	if user.Balance < post.Price {
		return dto.PurchaseResponseDTO{}, gorm.ErrInvalidTransaction
	}
	err = s.Repo.Create(&models.Purchase{
		UserID:    user.ID,
		PostID:    post.ID,
		Completed: true,
	})
	if err != nil {
		return dto.PurchaseResponseDTO{}, err
	}
	purchase, _ := s.Repo.FindByUserAndPost(user.ID, input.PostID.String())
	resp := dto.PurchaseResponseDTO{
		ID:        purchase.ID,
		UserID:    purchase.UserID,
		PostID:    purchase.PostID,
		Completed: purchase.Completed,
	}
	return resp, nil
}
