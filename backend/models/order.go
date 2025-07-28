package models

import "github.com/google/uuid"

type Order struct {
	ID     uuid.UUID `gorm:"type:uuid;primaryKey"`
	UserID uuid.UUID `gorm:"not null" validate:"required"`
	Summ   int       `gorm:"not null" validate:"required,min=1"`
}
