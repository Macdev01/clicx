package models

import (
	"github.com/google/uuid"
)

type Purchase struct {
	ID        uint      `gorm:"primaryKey"`
	UserID    uint      `gorm:"not null;index:idx_unique_purchase,unique"`
	PostID    uuid.UUID `gorm:"type:uuid;not null;index:idx_unique_purchase,unique"`
	Completed bool      `gorm:"default:false" json:"completed"`
}
