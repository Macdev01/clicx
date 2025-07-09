package models

type Admin struct {
	ID        int     `gorm:"primaryKey" json:"id"`
	Name      string  `json:"name"`
	Email     string  `gorm:"unique" json:"email"`
	Nickname  string  `gorm:"unique" json:"nickname"`
	Password  string  `json:"password"`
	Balance   float64 `json:"balance"`
	AvatarURL string  `json:"avatar_url"`
}
