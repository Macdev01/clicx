package models

import (
	"time"
)

type Media struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	PostID    uint      `gorm:"type:uuid;not null" json:"postId"` // один к одному
	Type      string    `json:"type"`                             // "video" или "photo"
	URL       string    `json:"url"`
	Cover     string    `json:"cover"`
	Duration  int       `json:"duration"` // в секундах
	Uploaded  bool      `gorm:"default:false" json:"uploaded"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}
