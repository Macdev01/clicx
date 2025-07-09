package models

type Order struct {
	UserID uint `gorm:"not null"`
	Summ   int  `gorm:"not null"`
}
