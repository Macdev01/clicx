package utils

import "fmt"

func GenerateReferralCode(userID int) string {
	return fmt.Sprintf("REF%06d", userID) // пример: REF000123
}
