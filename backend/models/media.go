package models

import (
	"time"

	"github.com/google/uuid"
)

type Media struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	PostID    uuid.UUID `gorm:"type:uuid" json:"post_id"` // один к одному
	Type      string    `json:"type"`                     // "video" или "photo"
	URL       string    `json:"url"`
	Cover     string    `json:"cover"`
	Duration  int       `json:"duration"` // в секундах
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}
