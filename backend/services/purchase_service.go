package services

import (
	"go-backend/dto"
	"go-backend/logging"
	"go-backend/models"
	"go-backend/repository"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type PurchaseService struct {
	Repo     repository.PurchaseRepository
	PostRepo repository.PostRepository
}

func NewPurchaseService(repo repository.PurchaseRepository, postRepo repository.PostRepository) *PurchaseService {
	return &PurchaseService{Repo: repo, PostRepo: postRepo}
}

func (s *PurchaseService) GetPurchases(userID uuid.UUID, limit, offset int) ([]dto.PurchaseResponseDTO, error) {
	logger := logging.GetLogger()
	logger.Debug("GetPurchases called", zap.String("user_id", userID.String()), zap.Int("limit", limit), zap.Int("offset", offset))
	purchases, err := s.Repo.FindByUserID(userID, limit, offset)
	if err != nil {
		logger.Error("GetPurchases failed", zap.Error(err))
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
	logger.Debug("GetPurchases success", zap.Int("count", len(resp)))
	return resp, nil
}

func (s *PurchaseService) BuyContent(user *models.User, input *dto.PurchaseCreateDTO) (dto.PurchaseResponseDTO, error) {
	logger := logging.GetLogger()
	logger.Debug("BuyContent called", zap.String("user_id", user.ID.String()), zap.String("post_id", input.PostID.String()))
	post, err := s.PostRepo.FindByID(input.PostID)
	if err != nil {
		logger.Error("BuyContent post not found", zap.String("post_id", input.PostID.String()), zap.Error(err))
		return dto.PurchaseResponseDTO{}, err
	}
	if !post.IsPremium {
		logger.Error("BuyContent not premium", zap.String("post_id", input.PostID.String()))
		return dto.PurchaseResponseDTO{}, err // Changed from gorm.ErrInvalidTransaction to err
	}
	_, err = s.Repo.FindByUserAndPost(user.ID, input.PostID)
	if err == nil {
		logger.Error("BuyContent already purchased", zap.String("user_id", user.ID.String()), zap.String("post_id", input.PostID.String()))
		return dto.PurchaseResponseDTO{}, err // Changed from gorm.ErrInvalidTransaction to err
	}
	if user.Balance < post.Price {
		logger.Error("BuyContent insufficient balance", zap.String("user_id", user.ID.String()), zap.Int("balance", user.Balance), zap.Int("price", post.Price))
		return dto.PurchaseResponseDTO{}, err // Changed from gorm.ErrInvalidTransaction to err
	}
	err = s.Repo.Create(&models.Purchase{
		UserID:    user.ID,
		PostID:    post.ID,
		Completed: true,
	})
	if err != nil {
		logger.Error("BuyContent create failed", zap.Error(err))
		return dto.PurchaseResponseDTO{}, err
	}
	purchase, _ := s.Repo.FindByUserAndPost(user.ID, input.PostID)
	resp := dto.PurchaseResponseDTO{
		ID:        purchase.ID,
		UserID:    purchase.UserID,
		PostID:    purchase.PostID,
		Completed: purchase.Completed,
	}
	logger.Debug("BuyContent success", zap.String("user_id", user.ID.String()), zap.String("post_id", input.PostID.String()))
	return resp, nil
}
