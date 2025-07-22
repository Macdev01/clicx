package models

type Order struct {
	ID     uint `gorm:"primaryKey"`
	UserID uint `gorm:"not null" validate:"required"`
	Summ   int  `gorm:"not null" validate:"required,min=1"`
}
