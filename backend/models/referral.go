package models

import "time"

// Referral tracks users invited through a referral code.
type Referral struct {
	ID            uint   `gorm:"primaryKey"`
	UserID        uint   // who invited
	ReferralCode  string // code used
	InvitedUserID uint   // new user
	CreatedAt     time.Time
}
