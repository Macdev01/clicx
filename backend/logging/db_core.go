package logging

import (
	"go-backend/database"
	"go-backend/models"

	"go.uber.org/zap/zapcore"
)

// dbCore writes zap logs into the database.
type dbCore struct {
	level zapcore.Level
}

// NewDBCore creates a zapcore.Core that saves logs to the DB.
func NewDBCore(level zapcore.Level) zapcore.Core {
	return &dbCore{level: level}
}

func (c *dbCore) Enabled(l zapcore.Level) bool {
	return l >= c.level
}

func (c *dbCore) With([]zapcore.Field) zapcore.Core { return c }

func (c *dbCore) Check(ent zapcore.Entry, ce *zapcore.CheckedEntry) *zapcore.CheckedEntry {
	if c.Enabled(ent.Level) {
		return ce.AddCore(ent, c)
	}
	return ce
}

func (c *dbCore) Write(ent zapcore.Entry, fields []zapcore.Field) error {
	logEntry := models.Log{
		Level:     ent.Level.String(),
		Message:   ent.Message,
		CreatedAt: ent.Time,
	}
	return database.DB.Create(&logEntry).Error
}

func (c *dbCore) Sync() error { return nil }
