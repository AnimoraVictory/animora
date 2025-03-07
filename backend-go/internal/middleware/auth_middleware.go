package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/htanos/animalia/backend-go/internal/auth"
	"github.com/htanos/animalia/backend-go/internal/models"
)

// AuthMiddleware is a middleware that verifies the JWT token in the Authorization header
func AuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get the Authorization header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "No token provided",
			})
		}

		// Check if the Authorization header has the Bearer prefix
		if !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid token format",
			})
		}

		// Extract the token
		token := strings.TrimPrefix(authHeader, "Bearer ")

		// Verify the token
		user, err := auth.VerifyToken(token)
		if err != nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Invalid or expired token",
			})
		}

		// Set the user in the context
		c.Locals("user", user)

		// Continue to the next middleware or handler
		return c.Next()
	}
}

// GetAuthUser gets the authenticated user from the context
func GetAuthUser(c *fiber.Ctx) *models.User {
	user, ok := c.Locals("user").(*models.User)
	if !ok {
		return nil
	}
	return user
}
