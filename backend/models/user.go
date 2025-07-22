package models

type User struct {
	ID        uint   `gorm:"primaryKey"`
	Email     string `gorm:"unique" json:"email" validate:"required,email"`
	Nickname  string `gorm:"unique" json:"nickname" validate:"required,min=3,max=32"`
	Password  string `json:"-" validate:"required,min=8"`
	Balance   int    `json:"balance"`
	AvatarURL string `json:"avatarUrl"`
	IsAdmin   bool   `gorm:"default:false" json:"isAdmin"`

	ReferralCode *string `gorm:"type:varchar(20);unique" json:"referral_code"`
	ReferredBy   *uint   `gorm:"index" json:"referred_by"` // FK to User.ID
}
