package main

import (
	"context"
	"log"
	"os"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/internal/routes"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	echoadapter "github.com/awslabs/aws-lambda-go-api-proxy/echo"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

var echoLambda *echoadapter.EchoLambda

// Initialize the Echo application and connect to the database
func init() {
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
		env = "development" // Default to development
	}
	if env == "production" {
		app.Logger.SetLevel(2)
	} else {
		app.Logger.SetLevel(1)
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
		return c.String(200, "Animalia API is running on Lambda!")
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

	// Initialize the Lambda adapter
	echoLambda = echoadapter.New(app)
}

// Lambda handler function
func Handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return echoLambda.ProxyWithContext(ctx, req)
}

func main() {
	lambda.Start(Handler)
}
