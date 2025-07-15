package middleware

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"strings"
	"sync"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

var (
	firebaseAuth *auth.Client
	once         sync.Once
)

// InitFirebase инициализирует Firebase SDK через переменные окружения
func InitFirebase() {
	once.Do(func() {
		privateKey := strings.ReplaceAll(os.Getenv("GOOGLE_PRIVATE_KEY"), `\n`, "\n")
		// Собираем креды из ENV
		credentials := map[string]string{
			"type":                        os.Getenv("GOOGLE_TYPE"),
			"project_id":                  os.Getenv("GOOGLE_PROJECT_ID"),
			"private_key_id":              os.Getenv("GOOGLE_PRIVATE_KEY_ID"),
			"private_key":                 privateKey,
			"client_email":                os.Getenv("GOOGLE_CLIENT_EMAIL"),
			"client_id":                   os.Getenv("GOOGLE_CLIENT_ID"),
			"auth_uri":                    os.Getenv("GOOGLE_AUTH_URI"),
			"token_uri":                   os.Getenv("GOOGLE_TOKEN_URI"),
			"auth_provider_x509_cert_url": os.Getenv("GOOGLE_AUTH_PROVIDER_X509_CERT_URL"),
			"client_x509_cert_url":        os.Getenv("GOOGLE_CLIENT_X509_CERT_URL"),
		}

		// Преобразуем в JSON
		credJSON, err := json.Marshal(credentials)
		if err != nil {
			log.Fatalf("Error marshaling Firebase credentials: %v", err)
		}

		// Инициализируем Firebase с JSON
		opt := option.WithCredentialsJSON(credJSON)
		app, err := firebase.NewApp(context.Background(), nil, opt)
		if err != nil {
			log.Fatalf("Firebase init error: %v", err)
		}

		client, err := app.Auth(context.Background())
		if err != nil {
			log.Fatalf("Firebase Auth error: %v", err)
		}

		firebaseAuth = client
		log.Println("✅ Firebase initialized from ENV")
	})
}

// GetFirebaseAuth — безопасный getter
func GetFirebaseAuth() *auth.Client {
	if firebaseAuth == nil {
		log.Fatal("❌ Firebase not initialized")
	}
	return firebaseAuth
}
