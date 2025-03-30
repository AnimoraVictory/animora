package routes

import (
	"github.com/aki-13627/animalia/backend-go/internal/injector"
	"github.com/labstack/echo/v4"
)

// SetupAuthRoutes sets up the auth routes
func SetupAuthRoutes(app *echo.Echo) {
	authHandler := injector.InjectAuthHandler()
	authGroup := app.Group("/auth")

	// Verify email
	authGroup.POST("/verify-email", authHandler.VerifyEmail)

	// Sign in
	authGroup.POST("/signin", authHandler.SignIn)

	// Sign up
	authGroup.POST("/signup", authHandler.SignUp)

	// Refresh token
	authGroup.POST("/refresh", authHandler.RefreshToken)

	// Get current user
	authGroup.GET("/me", authHandler.GetMe)

	// Sign out
	authGroup.POST("/signout", authHandler.SignOut)

	// Get session
	authGroup.GET("/session", authHandler.GetSession)
}
