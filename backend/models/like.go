package models

import (
	"time"
)

type Like struct {
	ID        uint `gorm:"primaryKey"`
	UserID    uint
	PostID    uint
	CreatedAt time.Time
}
