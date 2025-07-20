package main

import (
        "go-backend/config"
        "go-backend/logging"
        "go-backend/seed"
)

func main() {
        config.LoadConfig()
        logger, _ := logging.InitLogger("prod")
        defer logger.Sync()
        seed.SeedData()
        logger.Info("Сидинг завершён")
}
