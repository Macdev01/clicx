package models

import (
	"time"

	"github.com/google/uuid"
)

type Comment struct {
	ID     uuid.UUID `gorm:"type:uuid;primaryKey"`
	PostID uuid.UUID `gorm:"type:uuid" json:"post_id"`
	UserID uuid.UUID `json:"user_id"`
	User   User      `json:"user"`
	Text   string    `json:"text"`
	Time   time.Time `json:"time"`
}
