package main

import (
        "os"
        "strconv"

        "go-backend/config"
        "go-backend/database"
        "go-backend/logging"

        "go.uber.org/zap"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
)

func main() {
	// Загрузить конфиг из .env
        config.LoadConfig()
        logger, _ := logging.InitLogger("prod")
        defer logger.Sync()

	// Подключение к базе данных
	database.InitDB()

	// Получить *sql.DB из GORM
	gormDB := database.GetDB()
        sqlDB, err := gormDB.DB()
        if err != nil {
                logger.Fatal("Failed to extract *sql.DB from GORM", zap.Error(err))
        }
	defer sqlDB.Close()

	// Создание драйвера миграции
        driver, err := postgres.WithInstance(sqlDB, &postgres.Config{})
        if err != nil {
                logger.Fatal("Could not create migration driver", zap.Error(err))
        }

	// Создание мигратора
        m, err := migrate.NewWithDatabaseInstance(
                "file://migrations", // путь к папке с миграциями
                "postgres", driver,
        )
        if err != nil {
                logger.Fatal("Failed to create migrate instance", zap.Error(err))
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
                        logger.Fatal("Could not get version", zap.Error(err))
                }
                logger.Sugar().Infof("Migration version: %d, Dirty: %t", version, dirty)
                return
	case "force":
                if len(os.Args) < 3 {
                        logger.Fatal("Usage: go run cmd/migrate.go force <version>")
                }
		versionStr := os.Args[2]
		version, err := strconv.Atoi(versionStr)
		if err != nil {
                        logger.Fatal("Invalid version number", zap.Error(err))
                }
                err = m.Force(version)
                if err != nil {
                        logger.Fatal("Could not force version", zap.Error(err))
                }
                logger.Sugar().Infof("Forced version to %d", version)
                return
	default:
                logger.Fatal("Unsupported command", zap.String("command", command))
        }

	// Обработка результата
        if err != nil && err != migrate.ErrNoChange {
                logger.Fatal("Migration failed", zap.Error(err))
        }

        logger.Sugar().Infof("Migration '%s' completed successfully", command)
}
