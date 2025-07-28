package dto

import "github.com/google/uuid"

type UserCreateDTO struct {
	Email    string `json:"email" validate:"required,email"`
	Nickname string `json:"nickname" validate:"required,min=3,max=32"`
	Password string `json:"password" validate:"required,min=8"`
}

type UserResponseDTO struct {
	ID           uuid.UUID  `json:"id"`
	Email        string     `json:"email"`
	Nickname     string     `json:"nickname"`
	Balance      int        `json:"balance"`
	AvatarURL    string     `json:"avatarUrl"`
	IsAdmin      bool       `json:"isAdmin"`
	ReferralCode *string    `json:"referral_code"`
	ReferredBy   *uuid.UUID `json:"referred_by"`
}
