package dto

import "github.com/google/uuid"

type PostCreateDTO struct {
	Text      string    `json:"text" validate:"required"`
	IsPremium bool      `json:"isPremium"`
	UserID    uuid.UUID `json:"userId" validate:"required"`
	ModelID   uuid.UUID `json:"modelId" validate:"required"`
}

type PostResponseDTO struct {
	ID          uuid.UUID `json:"id"`
	Text        string    `json:"text"`
	IsPremium   bool      `json:"isPremium"`
	PublishedAt string    `json:"publishedAt"`
	LikesCount  int       `json:"likesCount"`
	Price       int       `json:"price"`
	UserID      uuid.UUID `json:"userId"`
	ModelID     uuid.UUID `json:"modelId"`
}
