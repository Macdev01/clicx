package models

type Order struct {
	ID     uint `gorm:"primaryKey"`
	UserID uint `gorm:"not null"`
	Summ   int  `gorm:"not null"`
}
