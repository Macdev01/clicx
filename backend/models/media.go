package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Media struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	PostID    uuid.UUID `gorm:"type:uuid" json:"post_id"` // один к одному
	Type      string    `json:"type"`                     // "video" или "photo"
	URL       string    `json:"url"`
	Cover     string    `json:"cover"`
	Duration  int       `json:"duration"` // в секундах
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

func (m *Media) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}
