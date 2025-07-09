package middleware

import (
	"context"
	"log"
	"sync"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

var (
	firebaseAuth *auth.Client
	once         sync.Once
)

// InitFirebase инициализирует Firebase SDK
func InitFirebase(serviceAccountPath string) {
	once.Do(func() {
		opt := option.WithCredentialsFile(serviceAccountPath)

		app, err := firebase.NewApp(context.Background(), nil, opt)
		if err != nil {
			log.Fatalf("Firebase init error: %v", err)
		}

		client, err := app.Auth(context.Background())
		if err != nil {
			log.Fatalf("Firebase Auth error: %v", err)
		}

		firebaseAuth = client
		log.Println("✅ Firebase initialized")
	})
}

// GetFirebaseAuth — безопасный getter
func GetFirebaseAuth() *auth.Client {
	if firebaseAuth == nil {
		log.Fatal("❌ Firebase not initialized")
	}
	return firebaseAuth
}
