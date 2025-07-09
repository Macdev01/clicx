package models

type ModelProfile struct {
	ID     uint `gorm:"primaryKey" json:"id"`
	UserID uint `json:"user_id"`
	User   User `gorm:"foreignKey:UserID" json:"user"`

	Bio    string `json:"bio"`
	Banner string `json:"banner"`
}
