package routes

import (
	"github.com/aki-13627/animalia/backend-go/internal/injector"
	"github.com/gofiber/fiber/v2"
)

// SetupAuthRoutes sets up the auth routes
func SetupAuthRoutes(app *fiber.App) {
	authHandler := injector.InjectAuthHandler()
	authGroup := app.Group("/auth")

	// Verify email
	authGroup.Post("/verify-email", authHandler.VerifyEmail())

	// Sign in
	authGroup.Post("/signin", authHandler.SignIn())

	// Sign up
	authGroup.Post("/signup", authHandler.SignUp())

	// Refresh token
	authGroup.Post("/refresh", authHandler.RefreshToken())

	// Get current user
	authGroup.Get("/me", authHandler.GetMe())

	// Sign out
	authGroup.Post("/signout", authHandler.SignOut())

	// Get session
	authGroup.Get("/session", authHandler.GetSession())
}
