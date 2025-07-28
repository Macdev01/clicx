package models

import (
	"time"

	"github.com/google/uuid"
)

type SavedPost struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	UserID    uuid.UUID
	PostID    uuid.UUID `gorm:"type:uuid"`
	CreatedAt time.Time
}
