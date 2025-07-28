package dto

import "github.com/google/uuid"

type OrderCreateDTO struct {
	UserID uuid.UUID `json:"user_id" validate:"required"`
	Summ   int       `json:"summ" validate:"required,min=1"`
}

type OrderResponseDTO struct {
	ID     uuid.UUID `json:"id"`
	UserID uuid.UUID `json:"user_id"`
	Summ   int       `json:"summ"`
}
