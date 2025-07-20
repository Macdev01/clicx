package middleware

import (
	"context"
	"encoding/json"
	"sync"

	"go-backend/config"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"go.uber.org/zap"
	"google.golang.org/api/option"
)

var (
	firebaseAuth *auth.Client
	once         sync.Once
)

// InitFirebase — инициализация Firebase на основе config.AppConfig
func InitFirebase(logger *zap.Logger) *auth.Client {
	once.Do(func() {
		// Собираем креды
		creds := map[string]string{
			"type":                        config.AppConfig.FirebaseType,
			"project_id":                  config.AppConfig.FirebaseProjectID,
			"private_key_id":              config.AppConfig.FirebasePrivateKeyID,
			"private_key":                 config.AppConfig.FirebasePrivateKey,
			"client_email":                config.AppConfig.FirebaseClientEmail,
			"client_id":                   config.AppConfig.FirebaseClientID,
			"auth_uri":                    config.AppConfig.FirebaseAuthURI,
			"token_uri":                   config.AppConfig.FirebaseTokenURI,
			"auth_provider_x509_cert_url": config.AppConfig.FirebaseAuthProviderCertURL,
			"client_x509_cert_url":        config.AppConfig.FirebaseClientCertURL,
		}

		// Преобразуем в JSON
		credJSON, err := json.Marshal(creds)
		if err != nil {
			logger.Fatal("failed to marshal firebase creds", zap.Error(err))
		}

		// Создаём Firebase App
		opt := option.WithCredentialsJSON(credJSON)
		app, err := firebase.NewApp(context.Background(), nil, opt)
		if err != nil {
			logger.Fatal("firebase init error", zap.Error(err))
		}

		// Клиент Auth
		client, err := app.Auth(context.Background())
		if err != nil {
			logger.Fatal("firebase auth error", zap.Error(err))
		}

		firebaseAuth = client
		logger.Info("Firebase initialized using config")
	})
	return firebaseAuth
}

// GetFirebaseAuth — безопасно возвращает клиента Firebase Auth
func GetFirebaseAuth() *auth.Client {
	return firebaseAuth
}
