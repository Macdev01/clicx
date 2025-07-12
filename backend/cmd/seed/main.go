package main

import (
	"log"

	"go-backend/config"
	"go-backend/seed"
)

func main() {
	config.LoadConfig()
	seed.SeedData()
	log.Println("✅ Сидинг завершён")
}
