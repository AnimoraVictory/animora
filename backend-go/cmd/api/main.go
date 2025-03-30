package main

import (
	"context"
	"log" // Standard log package
	"os"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/internal/routes"
	"github.com/aki-13627/animalia/backend-go/internal/seed"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
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

	// Create Echo app
	app := echo.New()
	app.HideBanner = true

	// Set log level based on ENV environment variable
	env := os.Getenv("ENV")
	if env == "" {
		env = "development" // デフォルト値として development を設定
	}
	if env == "production" {
		app.Logger.SetLevel(2)
	} else {
		app.Logger.SetLevel(1)
	}

	isSeed := os.Getenv("SEED")
	if isSeed == "true" {
		seed.SeedData(client)
	}

	// Set up middleware
	app.Use(middleware.Logger())
	app.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{echo.GET, echo.POST, echo.PUT, echo.DELETE},
		AllowHeaders:     []string{echo.HeaderContentType, echo.HeaderAuthorization},
		AllowCredentials: true,
		MaxAge:           600,
	}))

	// Set up routes
	app.GET("/", func(c echo.Context) error {
		return c.String(200, "Animalia API is running!")
	})

	// Add health check endpoint
	app.GET("/health", func(c echo.Context) error {
		log.Printf("Health check endpoint called")
		return c.JSON(200, map[string]interface{}{
			"status": "healthy",
		})
	})

	// Add debug route to check all routes
	app.GET("/debug/routes", func(c echo.Context) error {
		routes := []map[string]string{}
		for _, r := range app.Routes() {
			routes = append(routes, map[string]string{
				"method": r.Method,
				"path":   r.Path,
			})
		}
		return c.JSON(200, map[string]interface{}{
			"routes": routes,
		})
	})

	// Set up API routes
	log.Println("Setting up API routes...")
	routes.SetupAuthRoutes(app)
	routes.SetupPetRoutes(app)
	routes.SetupPostRoutes(app)
	routes.SetupUserRoutes(app)
	log.Println("API routes setup completed")

	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	// Start server
	log.Printf("Server is running on http://localhost:%s", port)
	if err := app.Start(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
