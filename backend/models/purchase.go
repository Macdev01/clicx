package models

import (
	"github.com/google/uuid"
)

type Purchase struct {
	ID     uint `gorm:"primaryKey"`
	UserID uint
	PostID uuid.UUID `gorm:"type:uuid"`
}
