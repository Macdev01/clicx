package models

import (
	"time"

	"github.com/google/uuid"
)

type Like struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	UserID    uuid.UUID
	PostID    uuid.UUID `gorm:"type:uuid" json:"post_id"`
	CreatedAt time.Time
}
