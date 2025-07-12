package models

import "time"

type Payment struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	TxnID       string    `gorm:"uniqueIndex" json:"txn_id"`
	OrderNumber string    `json:"order_number"`
	Amount      string    `json:"amount"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}
