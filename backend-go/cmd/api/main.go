package main

import (
	"context"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/htanos/animalia/backend-go/ent"
	"github.com/htanos/animalia/backend-go/internal/routes"
	"github.com/htanos/animalia/backend-go/internal/seed"
	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	// Get database URL from environment variable
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}

	client, err := ent.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}
	defer client.Close()
	// Auto migration
	if err := client.Schema.Create(context.Background()); err != nil {
		log.Fatalf("failed creating schema resources: %v", err)
	}

	// Set time format for zerolog
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix

	// Set log level based on ENV environment variable
	env := os.Getenv("ENV")
	if env == "" {
		env = "development" // デフォルト値として development を設定
	}
	if env == "production" {
		zerolog.SetGlobalLevel(zerolog.InfoLevel)
	} else {
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	}

	isSeed := os.Getenv("SEED")
	if isSeed == "true" {
		seed.SeedData(client)
	}

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName: "Animalia API",
	})

	// Set up middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173",
		AllowMethods:     "GET,POST,PUT,DELETE",
		AllowHeaders:     "Content-Type,Authorization",
		AllowCredentials: true,
		MaxAge:           600,
	}))

	// Set up routes
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Animalia API is running!")
	})

	// Set up API routes
	routes.SetupAuthRoutes(app)
	routes.SetupPetRoutes(app)
	routes.SetupPostRoutes(app)
	routes.SetupUserRoutes(app)

	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	// Start server
	log.Printf("Server is running on http://localhost:%s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
