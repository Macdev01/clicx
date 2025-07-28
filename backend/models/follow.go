package models

import (
	"time"

	"github.com/google/uuid"
)

// Follow represents a user's subscription to another user.
type Follow struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey"`
	FollowerID uuid.UUID
	FollowedID uuid.UUID
	CreatedAt  time.Time
}
