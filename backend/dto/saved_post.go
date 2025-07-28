package dto

import "github.com/google/uuid"

type SavedPostResponseDTO struct {
	ID     uuid.UUID `json:"id"`
	UserID uuid.UUID `json:"user_id"`
	PostID uuid.UUID `json:"post_id"`
}
