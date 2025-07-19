package logging

import "go.uber.org/zap"

// InitLogger создает zap.Logger для dev или prod
func InitLogger(env string) (*zap.Logger, error) {
	level := zap.InfoLevel
	if env == "dev" {
		level = zap.DebugLevel
	}
	core := NewDBCore(level)
	return zap.New(core), nil
}
