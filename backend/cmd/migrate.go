package main

import (
	"log"
	"os"
	"strconv"

	"mvp-go-backend/config"
	"mvp-go-backend/database"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
)

func main() {
	// Загрузить конфиг из .env
	config.LoadConfig()

	// Подключение к базе данных
	database.InitDB()

	// Получить *sql.DB из GORM
	gormDB := database.GetDB()
	sqlDB, err := gormDB.DB()
	if err != nil {
		log.Fatalf("❌ Failed to extract *sql.DB from GORM: %v", err)
	}
	defer sqlDB.Close()

	// Создание драйвера миграции
	driver, err := postgres.WithInstance(sqlDB, &postgres.Config{})
	if err != nil {
		log.Fatalf("❌ Could not create migration driver: %v", err)
	}

	// Создание мигратора
	m, err := migrate.NewWithDatabaseInstance(
		"file://migrations", // путь к папке с миграциями
		"postgres", driver,
	)
	if err != nil {
		log.Fatalf("❌ Failed to create migrate instance: %v", err)
	}

	// Определить команду
	command := "up"
	if len(os.Args) > 1 {
		command = os.Args[1]
	}

	// Выполнить команду
	switch command {
	case "up":
		err = m.Up()
	case "down":
		err = m.Down()
	case "drop":
		err = m.Drop()
	case "version":
		version, dirty, err := m.Version()
		if err != nil {
			log.Fatalf("❌ Could not get version: %v", err)
		}
		log.Printf("📦 Migration version: %d, Dirty: %t", version, dirty)
		return
	case "force":
		if len(os.Args) < 3 {
			log.Fatal("Usage: go run cmd/migrate.go force <version>")
		}
		versionStr := os.Args[2]
		version, err := strconv.Atoi(versionStr)
		if err != nil {
			log.Fatalf("Invalid version number: %v", err)
		}
		err = m.Force(version)
		if err != nil {
			log.Fatalf("❌ Could not force version: %v", err)
		}
		log.Printf("⚙️ Forced version to %d", version)
		return
	default:
		log.Fatalf("Unsupported command: %s. Available commands: up, down, drop, version, force", command)
	}

	// Обработка результата
	if err != nil && err != migrate.ErrNoChange {
		log.Fatalf("❌ Migration %s failed: %v", command, err)
	}

	log.Printf("✅ Migration '%s' completed successfully", command)
}
