package main

import (
	"log"

	"mvp-go-backend/config"
	"mvp-go-backend/seed"
)

func main() {
	config.LoadConfig()
	seed.SeedData()
	log.Println("✅ Сидинг завершён")
}
