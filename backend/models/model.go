package models

type ModelProfile struct {
	ID uint `gorm:"primaryKey" json:"id"`

	UserID uint `gorm:"uniqueIndex" json:"user_id"`
	User   User `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`

	Name string `json:"name"`

	Bio    string `json:"bio"`
	Banner string `json:"banner"`
}
