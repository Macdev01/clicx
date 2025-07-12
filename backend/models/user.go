package models

type User struct {
	ID        uint    `gorm:"primaryKey" json:"id"`
	Name      string  `json:"name"`
	Email     string  `gorm:"unique" json:"email"`
	Nickname  string  `gorm:"unique" json:"nickname"`
	Password  string  `json:"-"`
	Balance   float64 `json:"balance"`
	AvatarURL string  `json:"avatarUrl"`
}
