package models

import (
	"time"

	"github.com/google/uuid"
)

type Payment struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	TxnID       string    `gorm:"uniqueIndex" json:"txn_id"`
	OrderNumber string    `json:"order_number"`
	Amount      string    `json:"amount"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}
