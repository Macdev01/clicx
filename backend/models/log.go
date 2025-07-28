package models

import (
	"time"

	"github.com/google/uuid"
)

// Log represents a log record stored in the database.
type Log struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	Level     string
	Message   string
	CreatedAt time.Time
}
