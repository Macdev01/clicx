package services

import (
	"go-backend/database"
	"go-backend/models"
)

func DistributeReferralBonus(user models.User, purchaseAmount float64) {
	var level1, level2, level3 models.User

	// 1-й уровень
	if user.ReferredBy != nil {
		if err := database.DB.First(&level1, *user.ReferredBy).Error; err == nil {
			level1.Balance += int(purchaseAmount * 0.03) // 3%
			database.DB.Save(&level1)

			// 2-й уровень
			if level1.ReferredBy != nil {
				if err := database.DB.First(&level2, *level1.ReferredBy).Error; err == nil {
					level2.Balance += int(purchaseAmount * 0.02) // 2%
					database.DB.Save(&level2)

					// 3-й уровень
					if level2.ReferredBy != nil {
						if err := database.DB.First(&level3, *level2.ReferredBy).Error; err == nil {
							level3.Balance += int(purchaseAmount * 0.01) // 1%
							database.DB.Save(&level3)
						}
					}
				}
			}
		}
	}
}
