package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey"`
	Email        string     `gorm:"unique" json:"email" validate:"required,email"`
	Nickname     string     `gorm:"unique" json:"nickname" validate:"required,min=3,max=32"`
	Password     string     `json:"-" validate:"required,min=8"`
	Balance      int        `json:"balance"`
	AvatarURL    string     `json:"avatarUrl"`
	IsAdmin      bool       `gorm:"default:false" json:"isAdmin"`
	ReferralCode *string    `gorm:"type:varchar(20);unique" json:"referral_code"`
	ReferredBy   *uuid.UUID `gorm:"index" json:"referred_by"` // FK to User.ID
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}
