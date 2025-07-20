package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort    string
	DBHost     string
	DBPort     int
	DBUser     string
	DBPassword string
	DBName     string

	// Plisio
	PlisioKey    string
	PlisioSecret string

	// BunnyCDN
	BunnyStorageZone  string
	BunnyStorageKey   string
	BunnyPullZoneHost string
	BunnyTokenKey     string

	// Firebase
	FirebaseType                string
	FirebaseProjectID           string
	FirebasePrivateKeyID        string
	FirebasePrivateKey          string
	FirebaseClientEmail         string
	FirebaseClientID            string
	FirebaseAuthURI             string
	FirebaseTokenURI            string
	FirebaseAuthProviderCertURL string
	FirebaseClientCertURL       string
}

var AppConfig *Config

func LoadConfig() {
	// Загружаем .env (если есть)
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ .env файл не найден, читаем из системных переменных")
	}

	// Парсим порт БД
	port, err := strconv.Atoi(getEnv("DB_PORT", "5432"))
	if err != nil {
		log.Fatalf("❌ Невалидный DB_PORT: %v", err)
	}

	AppConfig = &Config{
		AppPort:    getEnv("APP_PORT", "8080"),
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     port,
		DBUser:     getEnv("DB_USER", ""),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", ""),

		PlisioKey:    getEnv("PLISIO_API_KEY", ""),
		PlisioSecret: getEnv("PLISIO_SECRET_KEY", ""),

		BunnyStorageZone:  getEnv("BUNNY_STORAGE_ZONE", ""),
		BunnyStorageKey:   getEnv("BUNNY_STORAGE_KEY", ""),
		BunnyPullZoneHost: getEnv("BUNNY_PULL_ZONE_HOSTNAME", ""),
		BunnyTokenKey:     getEnv("BUNNY_TOKEN_KEY", ""),

		// Firebase
		FirebaseType:                getEnv("GOOGLE_TYPE", ""),
		FirebaseProjectID:           getEnv("GOOGLE_PROJECT_ID", ""),
		FirebasePrivateKeyID:        getEnv("GOOGLE_PRIVATE_KEY_ID", ""),
		FirebasePrivateKey:          strings.ReplaceAll(getEnv("GOOGLE_PRIVATE_KEY", ""), `\n`, "\n"),
		FirebaseClientEmail:         getEnv("GOOGLE_CLIENT_EMAIL", ""),
		FirebaseClientID:            getEnv("GOOGLE_CLIENT_ID", ""),
		FirebaseAuthURI:             getEnv("GOOGLE_AUTH_URI", ""),
		FirebaseTokenURI:            getEnv("GOOGLE_TOKEN_URI", ""),
		FirebaseAuthProviderCertURL: getEnv("GOOGLE_AUTH_PROVIDER_X509_CERT_URL", ""),
		FirebaseClientCertURL:       getEnv("GOOGLE_CLIENT_X509_CERT_URL", ""),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
