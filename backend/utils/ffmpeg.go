package utils

import (
	"encoding/base64"
	"io/ioutil"
	"math"
	"os"
	"os/exec"
	"strconv"
	"strings"

	"go.uber.org/zap"
)

// ExtractVideoMetadata extracts duration and generates a thumbnail for a video file.
// Returns duration in seconds and thumbnail as base64 PNG data URL.
func ExtractVideoMetadata(filePath string, logger *zap.Logger) (int, string, error) {
	// Extract duration using ffprobe
	cmd := exec.Command("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filePath)
	out, err := cmd.Output()
	if err != nil {
		logger.Error("ffprobe failed", zap.Error(err))
		return 0, "", err
	}
	durF, err := strconv.ParseFloat(strings.TrimSpace(string(out)), 64)
	if err != nil {
		logger.Error("duration parse failed", zap.Error(err))
		return 0, "", err
	}
	duration := int(math.Round(durF))

	// Generate thumbnail at 1 second (or 0 if shorter)
	thumbPath := filePath + "-thumb.png"
	thumbTime := "1"
	if duration < 3 {
		thumbTime = "0"
	}
	cmd = exec.Command("ffmpeg", "-y", "-i", filePath, "-ss", thumbTime, "-vframes", "1", thumbPath)
	if err := cmd.Run(); err != nil {
		logger.Error("ffmpeg thumbnail failed", zap.Error(err))
		return duration, "", err
	}
	defer os.Remove(thumbPath)

	thumbData, err := ioutil.ReadFile(thumbPath)
	if err != nil {
		logger.Error("thumbnail read failed", zap.Error(err))
		return duration, "", err
	}
	thumbnail := "data:image/png;base64," + base64.StdEncoding.EncodeToString(thumbData)
	return duration, thumbnail, nil
}
