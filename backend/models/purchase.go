package models

import (
	"github.com/google/uuid"
)

type Purchase struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey"`
	UserID    uuid.UUID  `gorm:"not null;index:idx_unique_purchase,unique"`
	PostID    uuid.UUID  `gorm:"type:uuid;not null;index:idx_unique_purchase,unique"`
	Completed bool       `gorm:"default:false" json:"completed"`
	PhotoID   *uuid.UUID // nullable, for per-photo purchase
	VideoID   *uuid.UUID // nullable, for per-video purchase
}
