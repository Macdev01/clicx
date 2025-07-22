package dto

type ModelProfileCreateDTO struct {
	UserID uint   `json:"user_id" validate:"required"`
	Name   string `json:"name" validate:"required,min=2,max=64"`
	Bio    string `json:"bio" validate:"max=512"`
	Banner string `json:"banner"`
}

type ModelProfileResponseDTO struct {
	ID     uint   `json:"id"`
	UserID uint   `json:"user_id"`
	Name   string `json:"name"`
	Bio    string `json:"bio"`
	Banner string `json:"banner"`
}
