package services

import (
	"log"

	"go-backend/models"
)

// DistributeReferralBonus is a placeholder for referral bonus calculation.
// Currently it only logs the bonus distribution request.
func DistributeReferralBonus(user models.User, amount float64) {
	log.Printf("Referral bonus for user %d on purchase %.2f not implemented", user.ID, amount)
}
