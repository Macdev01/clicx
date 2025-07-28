package models

import (
	"time"

	"github.com/google/uuid"
)

type Image struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Filename  string    `json:"filename"`
	CDNUrl    string    `json:"cdn_url"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}
