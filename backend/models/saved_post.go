package models

import (
	"github.com/google/uuid"
	"time"
)

type SavedPost struct {
	ID        uint `gorm:"primaryKey"`
	UserID    uint
	PostID    uuid.UUID `gorm:"type:uuid"`
	CreatedAt time.Time
}
