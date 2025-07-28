package models

import (
	"time"

	"github.com/google/uuid"
)

type Stream struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Title         string    `json:"title"`
	BunnyStreamID string    `json:"bunny_stream_id"`
	RTMPUrl       string    `json:"rtmp_url"`
	StreamKey     string    `json:"stream_key"`
	PlaybackUrl   string    `json:"playback_url"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
}
