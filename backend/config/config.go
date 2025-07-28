package config

import (
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
	"go.uber.org/zap"
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
	BunnyStorageZone   string
	BunnyStorageKey    string
	BunnyPullZoneHost  string
	BunnyTokenKey      string
	BunnyStorageAPIKey string
	BunnyStorageHost   string

	// Video Uploads
	UploadPath string

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

	BunnyStreamAPI       string
	BunnyStreamAPIKey    string
	BunnyStreamLibraryID string
	BunnyStreamHost      string
}

var AppConfig *Config

func LoadConfig() {
	// Загружаем .env (если есть)
	if err := godotenv.Load(); err != nil {
		zap.L().Warn(".env файл не найден, читаем из системных переменных", zap.Error(err))
	}

	// Парсим порт БД
	port, err := strconv.Atoi(getEnv("DB_PORT", "5432"))
	if err != nil {
		zap.L().Fatal("Невалидный DB_PORT", zap.Error(err))
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

		BunnyStorageZone:   getEnv("BUNNY_STORAGE_ZONE", ""),
		BunnyStorageKey:    getEnv("BUNNY_STORAGE_KEY", ""),
		BunnyPullZoneHost:  getEnv("BUNNY_PULL_ZONE_HOSTNAME", ""),
		BunnyTokenKey:      getEnv("BUNNY_TOKEN_KEY", ""),
		BunnyStorageAPIKey: getEnv("BUNNY_STORAGE_API_KEY", ""),
		BunnyStorageHost:   getEnv("BUNNY_STORAGE_HOSTNAME", ""),

		UploadPath: getEnv("UPLOAD_PATH", "uploads"),

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

		BunnyStreamAPI:       getEnv("BUNNY_STREAM_API", ""),
		BunnyStreamAPIKey:    getEnv("BUNNY_STREAM_API_KEY", ""),
		BunnyStreamLibraryID: getEnv("BUNNY_STREAM_LIBRARY_ID", ""),
		BunnyStreamHost:      getEnv("BUNNY_STREAM_HOSTNAME", ""),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
