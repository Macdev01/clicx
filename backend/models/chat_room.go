package models

import (
	"time"

	"github.com/google/uuid"
)

type ChatRoom struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	StreamID   uuid.UUID `gorm:"type:uuid" json:"stream_id"`
	ChatRoomID string    `json:"chat_room_id"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
}
