package dto

import "github.com/google/uuid"

type PurchaseCreateDTO struct {
	PostID uuid.UUID `json:"post_id" validate:"required"`
}

type PurchaseResponseDTO struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id"`
	PostID    uuid.UUID `json:"post_id"`
	Completed bool      `json:"completed"`
}
