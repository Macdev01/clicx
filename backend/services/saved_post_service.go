package services

import (
	"go-backend/dto"
	"go-backend/logging"
	"go-backend/repository"

	"go.uber.org/zap"
)

type SavedPostService struct {
	Repo repository.SavedPostRepository
}

func NewSavedPostService(repo repository.SavedPostRepository) *SavedPostService {
	return &SavedPostService{Repo: repo}
}

func (s *SavedPostService) GetSavedPosts(userID string, limit, offset int) ([]dto.SavedPostResponseDTO, error) {
	logger := logging.GetLogger()
	logger.Debug("GetSavedPosts called", zap.String("user_id", userID), zap.Int("limit", limit), zap.Int("offset", offset))
	savedPosts, err := s.Repo.FindByUserID(userID, limit, offset)
	if err != nil {
		logger.Error("GetSavedPosts failed", zap.Error(err))
		return nil, err
	}
	resp := make([]dto.SavedPostResponseDTO, 0, len(savedPosts))
	for _, sp := range savedPosts {
		resp = append(resp, dto.SavedPostResponseDTO{
			ID:     sp.ID,
			UserID: sp.UserID,
			PostID: sp.PostID,
		})
	}
	logger.Debug("GetSavedPosts success", zap.Int("count", len(resp)))
	return resp, nil
}
