package main

import (
	"flag"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/htanos/animalia/backend-go/internal/auth"
	"github.com/htanos/animalia/backend-go/internal/models"
	"github.com/htanos/animalia/backend-go/internal/routes"
	"github.com/htanos/animalia/backend-go/internal/seed"
	"github.com/htanos/animalia/backend-go/internal/services"
	"github.com/joho/godotenv"
)

func main() {
	// Define command-line flags
	seedFlag := flag.Bool("seed", false, "Seed the database with sample data")
	flag.Parse()

	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	// Initialize database
	models.InitDB()

	// Run seed data if flag is set
	if *seedFlag {
		log.Println("Seeding database with sample data...")
		if err := seed.SeedData(models.DB); err != nil {
			log.Fatalf("Failed to seed database: %v", err)
		}
		log.Println("Database seeding completed successfully")
		return
	}

	// Initialize auth services
	auth.InitAuth()

	// Initialize S3 service
	services.InitS3()

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
	routes.SetupUserRoutes(app)
	routes.SetupPetRoutes(app)
	routes.SetupPostRoutes(app)

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
