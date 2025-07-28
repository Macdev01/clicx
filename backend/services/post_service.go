package services

import (
	"go-backend/dto"
	"go-backend/logging"
	"go-backend/models"
	"go-backend/repository"
	"time"

	"go.uber.org/zap"
)

type PostService struct {
	Repo repository.PostRepository
}

func NewPostService(repo repository.PostRepository) *PostService {
	return &PostService{Repo: repo}
}

func (s *PostService) GetPosts(limit, offset int) ([]dto.PostResponseDTO, error) {
	logger := logging.GetLogger()
	logger.Debug("GetPosts called", zap.Int("limit", limit), zap.Int("offset", offset))
	posts, err := s.Repo.FindAll(limit, offset)
	if err != nil {
		logger.Error("GetPosts failed", zap.Error(err))
		return nil, err
	}
	resp := make([]dto.PostResponseDTO, 0, len(posts))
	for _, post := range posts {
		resp = append(resp, dto.PostResponseDTO{
			ID:          post.ID,
			Text:        post.Text,
			IsPremium:   post.IsPremium,
			PublishedAt: post.PublishedAt.Format(time.RFC3339),
			LikesCount:  post.LikesCount,
			Price:       post.Price,
			UserID:      post.UserID,
			ModelID:     post.ModelID,
		})
	}
	logger.Debug("GetPosts success", zap.Int("count", len(resp)))
	return resp, nil
}

func (s *PostService) CreatePost(input *dto.PostCreateDTO) (dto.PostResponseDTO, error) {
	logger := logging.GetLogger()
	logger.Debug("CreatePost called", zap.String("user_id", input.UserID.String()), zap.String("model_id", input.ModelID.String()))
	post := models.Post{
		Text:      input.Text,
		IsPremium: input.IsPremium,
		UserID:    input.UserID,
		ModelID:   input.ModelID,
	}
	if err := s.Repo.Create(&post); err != nil {
		logger.Error("CreatePost failed", zap.Error(err))
		return dto.PostResponseDTO{}, err
	}
	resp := dto.PostResponseDTO{
		ID:          post.ID,
		Text:        post.Text,
		IsPremium:   post.IsPremium,
		PublishedAt: post.PublishedAt.Format(time.RFC3339),
		LikesCount:  post.LikesCount,
		Price:       post.Price,
		UserID:      post.UserID,
		ModelID:     post.ModelID,
	}
	logger.Debug("CreatePost success", zap.String("post_id", post.ID.String()))
	return resp, nil
}
