package models

import (
	"time"

	"github.com/google/uuid"
)

type Like struct {
	ID        uint `gorm:"primaryKey"`
	UserID    uint
	PostID    uuid.UUID `gorm:"type:uuid" json:"post_id"`
	CreatedAt time.Time
}
