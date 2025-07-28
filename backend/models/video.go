package models

import (
	"time"

	"github.com/google/uuid"
)

type Video struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	BunnyVideoID string    `json:"bunny_video_id"`
	Title        string    `json:"title"`
	CDNUrl       string    `json:"cdn_url"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
}
