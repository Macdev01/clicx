package database

import (
        "fmt"
        "go-backend/config"
        "go-backend/models"

        "go.uber.org/zap"

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
                zap.L().Fatal("Не удалось подключиться к БД", zap.Error(err))
        }

        DB = db
        zap.L().Info("Успешное подключение к БД")
}

func GetDB() *gorm.DB {
        if DB == nil {
                zap.L().Fatal("БД не инициализирована. Сначала вызови InitDB()")
        }
	return DB
}

func MigrateAll() error {
	err := DB.AutoMigrate(
		&models.User{},
		&models.ModelProfile{},
		&models.Media{},
		&models.Comment{},
		&models.Post{},
		&models.Order{},
		&models.Payment{},
		&models.Like{},
		&models.Purchase{},
		&models.SavedPost{},
		&models.Follow{},
		&models.Referral{},
		&models.Log{},
	)
        if err != nil {
                return fmt.Errorf("ошибка миграции: %w", err)
        }

        zap.L().Info("Миграции прошли успешно")
        return nil
}
