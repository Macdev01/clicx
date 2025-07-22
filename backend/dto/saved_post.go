package dto

import "github.com/google/uuid"

type SavedPostResponseDTO struct {
	ID     uint      `json:"id"`
	UserID uint      `json:"user_id"`
	PostID uuid.UUID `json:"post_id"`
}
