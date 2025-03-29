package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/htanos/animalia/backend-go/internal/domain/models"
	"github.com/htanos/animalia/backend-go/internal/routes"
	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	// Initialize database
	models.InitDB()

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
