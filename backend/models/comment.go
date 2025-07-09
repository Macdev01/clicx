package models

import (
	"time"

	"github.com/google/uuid"
)

type Comment struct {
	PostID uuid.UUID `json:"post_id"`
	UserID uint      `json:"user_id"`
	User   User      `json:"user"`
	Text   string    `json:"text"`
	Time   time.Time `json:"time"`
}
