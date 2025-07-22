package dto

type OrderCreateDTO struct {
	UserID uint `json:"userId" validate:"required"`
	Summ   int  `json:"summ" validate:"required,min=1"`
}

type OrderResponseDTO struct {
	ID     uint `json:"id"`
	UserID uint `json:"userId"`
	Summ   int  `json:"summ"`
}
