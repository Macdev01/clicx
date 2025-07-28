package logging

import (
	"encoding/json"
	"os"
	"strings"
	"sync"
	"time"

	"go-backend/database"
	"go-backend/models"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

var (
	globalLogger *zap.Logger
	once         sync.Once
)

// LoggerConfig holds config for logger initialization
type LoggerConfig struct {
	Level    string
	ToFile   bool
	FilePath string
	Env      string // "dev" or "prod"
}

// getEnv returns the value of an env var or fallback
func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// InitLogger initializes the global zap logger with multi-core support
func InitLogger() (*zap.Logger, error) {
	var err error
	once.Do(func() {
		cfg := LoggerConfig{
			Level:    getEnv("LOG_LEVEL", "info"),
			ToFile:   getEnv("LOG_TO_FILE", "false") == "true",
			FilePath: getEnv("LOG_FILE_PATH", "logs/app.log"),
			Env:      getEnv("GIN_MODE", "dev"),
		}

		var level zapcore.Level
		switch strings.ToLower(cfg.Level) {
		case "debug":
			level = zapcore.DebugLevel
		case "warn":
			level = zapcore.WarnLevel
		case "error":
			level = zapcore.ErrorLevel
		default:
			level = zapcore.InfoLevel
		}

		var encoder zapcore.Encoder
		if cfg.Env == "prod" {
			encoder = zapcore.NewJSONEncoder(zap.NewProductionEncoderConfig())
		} else {
			encoder = zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig())
		}

		cores := []zapcore.Core{}

		// stdout
		cores = append(cores, zapcore.NewCore(encoder, zapcore.AddSync(os.Stdout), level))

		// file (with rotation)
		if cfg.ToFile {
			fileWriter := zapcore.AddSync(&lumberjack.Logger{
				Filename:   cfg.FilePath,
				MaxSize:    100, // MB
				MaxBackups: 5,
				MaxAge:     30, // days
				Compress:   true,
			})
			cores = append(cores, zapcore.NewCore(encoder, fileWriter, level))
		}

		// async DB logging via channel/worker
		cores = append(cores, NewAsyncDBCore(level))

		globalLogger = zap.New(zapcore.NewTee(cores...))
		zap.ReplaceGlobals(globalLogger)
	})
	return globalLogger, err
}

// GetLogger returns the global logger
func GetLogger() *zap.Logger {
	if globalLogger == nil {
		InitLogger()
	}
	return globalLogger
}

// Async DB core (logs to DB via channel/worker)
type asyncDBCore struct {
	level   zapcore.Level
	logChan chan zapcore.Entry
}

func NewAsyncDBCore(level zapcore.Level) zapcore.Core {
	core := &asyncDBCore{
		level:   level,
		logChan: make(chan zapcore.Entry, 1000),
	}
	go core.worker()
	return core
}

func (c *asyncDBCore) Enabled(l zapcore.Level) bool      { return l >= c.level }
func (c *asyncDBCore) With([]zapcore.Field) zapcore.Core { return c }
func (c *asyncDBCore) Check(ent zapcore.Entry, ce *zapcore.CheckedEntry) *zapcore.CheckedEntry {
	if c.Enabled(ent.Level) {
		return ce.AddCore(ent, c)
	}
	return ce
}
func (c *asyncDBCore) Write(ent zapcore.Entry, fields []zapcore.Field) error {
	logEntry := dbLogEntry{
		Timestamp: ent.Time,
		Level:     ent.Level.String(),
		Message:   ent.Message,
		Context:   make(map[string]interface{}),
	}
	for _, f := range fields {
		logEntry.Context[f.Key] = f.Interface
		if f.Key == "request_id" {
			if v, ok := f.Interface.(string); ok {
				logEntry.RequestID = v
			}
		}
		if f.Key == "user_id" {
			if v, ok := f.Interface.(string); ok {
				logEntry.UserID = v
			}
		}
		if f.Key == "endpoint" {
			if v, ok := f.Interface.(string); ok {
				logEntry.Endpoint = v
			}
		}
		if f.Key == "method" {
			if v, ok := f.Interface.(string); ok {
				logEntry.Method = v
			}
		}
	}
	select {
	case c.logChan <- ent:
		// buffered
	default:
		// drop if full
	}
	// Also send to DB log channel
	select {
	case dbLogChan <- logEntry:
	default:
	}
	return nil
}
func (c *asyncDBCore) Sync() error { return nil }

var dbLogChan = make(chan dbLogEntry, 1000)

func (c *asyncDBCore) worker() {
	batch := make([]models.Log, 0, 20)
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case entry := <-dbLogChan:
			batch = append(batch, models.Log{
				Level:     entry.Level,
				Message:   entry.Message + marshalContext(entry.Context),
				CreatedAt: entry.Timestamp,
			})
			if len(batch) >= 20 {
				database.DB.Create(&batch)
				batch = batch[:0]
			}
		case <-ticker.C:
			if len(batch) > 0 {
				database.DB.Create(&batch)
				batch = batch[:0]
			}
		}
	}
}

func marshalContext(ctx map[string]interface{}) string {
	if len(ctx) == 0 {
		return ""
	}
	b, _ := json.Marshal(ctx)
	return " | context: " + string(b)
}

type dbLogEntry struct {
	Timestamp time.Time
	Level     string
	Message   string
	RequestID string
	UserID    string
	Endpoint  string
	Method    string
	Context   map[string]interface{}
}
