package services

import (
	"go-backend/dto"
	"go-backend/repository"
)

type SavedPostService struct {
	Repo repository.SavedPostRepository
}

func NewSavedPostService(repo repository.SavedPostRepository) *SavedPostService {
	return &SavedPostService{Repo: repo}
}

func (s *SavedPostService) GetSavedPosts(userID string, limit, offset int) ([]dto.SavedPostResponseDTO, error) {
	savedPosts, err := s.Repo.FindByUserID(userID, limit, offset)
	if err != nil {
		return nil, err
	}
	resp := make([]dto.SavedPostResponseDTO, 0, len(savedPosts))
	for _, s := range savedPosts {
		resp = append(resp, dto.SavedPostResponseDTO{
			ID:     s.ID,
			UserID: s.UserID,
			PostID: s.PostID,
		})
	}
	return resp, nil
}
