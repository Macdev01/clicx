package models

type User struct {
	ID        uint    `gorm:"primaryKey"`
	Name      string  `json:"name"`
	Email     string  `gorm:"unique" json:"email"`
	Nickname  string  `gorm:"unique" json:"nickname"`
	Password  string  `json:"-"`
	Balance   float64 `json:"balance"`
	AvatarURL string  `json:"avatarUrl"`
	IsAdmin   bool    `gorm:"default:false" json:"isAdmin"`
}
