package utils

import (
	"math/rand"
	"time"
)

// GenerateReferralCode возвращает случайный реферальный код длиной n.
// Код состоит из заглавных букв и цифр и имеет префикс "REF".
func GenerateReferralCode(n int) string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	rand.Seed(time.Now().UnixNano())
	b := make([]byte, n)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return "REF" + string(b)
}
