package services

import (
	"go-backend/dto"
	"go-backend/models"
	"go-backend/repository"
	"time"
)

type PostService struct {
	Repo repository.PostRepository
}

func NewPostService(repo repository.PostRepository) *PostService {
	return &PostService{Repo: repo}
}

func (s *PostService) GetPosts(limit, offset int) ([]dto.PostResponseDTO, error) {
	posts, err := s.Repo.FindAll(limit, offset)
	if err != nil {
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
	return resp, nil
}

func (s *PostService) CreatePost(input *dto.PostCreateDTO) (dto.PostResponseDTO, error) {
	post := models.Post{
		Text:      input.Text,
		IsPremium: input.IsPremium,
		UserID:    input.UserID,
		ModelID:   input.ModelID,
	}
	if err := s.Repo.Create(&post); err != nil {
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
	return resp, nil
}
