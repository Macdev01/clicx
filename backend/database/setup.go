package database

import (
	"database/sql"
	"fmt"
	"log"
	"mvp-go-backend/config"
	"mvp-go-backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	cfg := config.AppConfig
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%d sslmode=disable TimeZone=Asia/Bangkok",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Не удалось подключиться к БД: %v", err)
	}

	DB = db
	log.Println("✅ Успешное подключение к БД")
}

func GetDB() *sql.DB {
	if DB == nil {
		log.Fatal("БД не инициализирована. Сначала вызови InitDB()")
	}

	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatalf("Не удалось получить *sql.DB из GORM: %v", err)
	}

	return sqlDB
}

func MigrateAll() {
	err := DB.AutoMigrate(
		&models.Admin{},
		&models.User{},
		&models.ModelProfile{},
		&models.Media{},
		&models.Comment{},
		&models.Post{},
		&models.Order{},
	)
	if err != nil {
		log.Fatalf("Ошибка миграции: %v", err)
	}

	log.Println("Миграции прошли успешно")
}
