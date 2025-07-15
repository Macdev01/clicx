package logging

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// InitLogger создает zap.Logger для dev или prod
func InitLogger(env string) (*zap.Logger, error) {
	var cfg zap.Config

	if env == "dev" {
		// Development mode: цветной вывод
		cfg = zap.NewDevelopmentConfig()
		cfg.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	} else {
		// Production mode: JSON формат
		cfg = zap.NewProductionConfig()
	}

	cfg.OutputPaths = []string{"stdout"} // По умолчанию вывод в консоль
	return cfg.Build()
}
