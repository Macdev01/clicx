package utils

import (
	"strings"

	"golang.org/x/crypto/bcrypt"
)

// HashPassword hashes a plain password using bcrypt.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash compares a plain password with a bcrypt hash.
func CheckPasswordHash(password, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

// GenerateNickname generates a nickname from email.
func GenerateNickname(email string) string {
	return "user_" + strings.Split(email, "@")[0]
}
