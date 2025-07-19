package utils

import (
	"crypto/rand"
	"encoding/hex"
)

// GenerateReferralCode returns a random referral code.
func GenerateReferralCode() string {
	b := make([]byte, 4)
	if _, err := rand.Read(b); err != nil {
		return ""
	}
	return hex.EncodeToString(b)
}
