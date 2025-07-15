package models

import (
	"time"
)

type Comment struct {
	ID     uint      `gorm:"primaryKey"`
	PostID uint      `json:"post_id"`
	UserID uint      `json:"user_id"`
	User   User      `json:"user"`
	Text   string    `json:"text"`
	Time   time.Time `json:"time"`
}
