package models

import (
	"time"

	"github.com/google/uuid"
)

type Post struct {
	ID          uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"postId"`
	Text        string    `json:"text"`
	IsPremium   bool      `json:"isPremium"`
	PublishedAt time.Time `json:"published_time"`
	LikesCount  int       `json:"likes_count"`

	UserID       uint         `json:"-"`
	User         User         `json:"user"`
	ModelID      uint         `json:"-"`
	ModelProfile ModelProfile `gorm:"foreignKey:ModelID" json:"model"`
	Media        []Media      `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"media"`
	Comments     []Comment    `gorm:"foreignKey:PostID" json:"comments"`
	IsPurchased  bool         `gorm:"-" json:"isPurchased"`

	CreatedAt time.Time `gorm:"-" json:"-"` // <--- вот это важно
}
