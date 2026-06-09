package config

import (
	"errors"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv      string
	BaseURL     string
	HTTPAddr    string
	DatabaseURL string
	LimenSecret string
}

func Load() (Config, error) {
	_ = godotenv.Load()

	cfg := Config{
		AppEnv:      getEnv("APP_ENV", "development"),
		BaseURL:     getEnv("BASE_URL", "http://localhost:8080"),
		HTTPAddr:    getEnv("HTTP_ADDR", ":8080"),
		DatabaseURL: os.Getenv("DATABASE_URL"),
		LimenSecret: os.Getenv("LIMEN_SECRET"),
	}

	if cfg.DatabaseURL == "" {
		return Config{}, errors.New("DATABASE_URL is required")
	}

	if len(cfg.LimenSecret) != 32 {
		return Config{}, errors.New("LIMEN_SECRET must be exactly 32 bytes")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
