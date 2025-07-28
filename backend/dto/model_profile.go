package dto

import "github.com/google/uuid"

type ModelProfileCreateDTO struct {
	UserID uuid.UUID `json:"user_id" validate:"required"`
	Name   string    `json:"name" validate:"required,min=2,max=64"`
	Bio    string    `json:"bio" validate:"max=512"`
	Banner string    `json:"banner"`
}

type ModelProfileResponseDTO struct {
	ID     uuid.UUID `json:"id"`
	UserID uuid.UUID `json:"user_id"`
	Name   string    `json:"name"`
	Bio    string    `json:"bio"`
	Banner string    `json:"banner"`
}
