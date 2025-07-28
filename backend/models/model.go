package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ModelProfile struct {
	ID     uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID uuid.UUID `gorm:"uniqueIndex" json:"user_id"`
	User   User      `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
	Name   string    `json:"name"`
	Bio    string    `json:"bio"`
	Banner string    `json:"banner"`
}

func (m *ModelProfile) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}
