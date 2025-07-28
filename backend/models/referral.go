package models

import (
	"time"

	"github.com/google/uuid"
)

// Referral tracks users invited through a referral code.
type Referral struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey"`
	UserID        uuid.UUID
	ReferralCode  string
	InvitedUserID uuid.UUID
	CreatedAt     time.Time
}
