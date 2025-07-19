package models

import "time"

// Follow represents a user's subscription to another user.
type Follow struct {
	ID         uint `gorm:"primaryKey"`
	FollowerID uint
	FollowedID uint
	CreatedAt  time.Time
}
