package models

import "time"

// Log represents a log record stored in the database.
type Log struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Level     string    `json:"level"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}
