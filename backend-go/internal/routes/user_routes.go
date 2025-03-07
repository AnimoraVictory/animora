package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/htanos/animalia/backend-go/internal/auth"
	"github.com/htanos/animalia/backend-go/internal/middleware"
	"github.com/htanos/animalia/backend-go/internal/models"
)

// SetupUserRoutes sets up the user routes
func SetupUserRoutes(app *fiber.App) {
	userGroup := app.Group("/users")

	// Create a new user
	userGroup.Post("/", createUser)

	// Get the current user
	userGroup.Get("/me", middleware.AuthMiddleware(), getUser)
}

// createUser creates a new user
func createUser(c *fiber.Ctx) error {
	// Parse request body
	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate request
	if req.Name == "" || req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "情報が不足しています",
		})
	}

	// Check if user already exists
	var existingUser models.User
	if err := models.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "このメールアドレスは既に登録されています",
		})
	}

	// Create user
	user, err := auth.SignUp(req.Name, req.Email, req.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Cognito 登録に失敗しました",
		})
	}

	return c.JSON(fiber.Map{
		"message": "アカウントが作成されました",
		"user":    user,
	})
}

// getUser gets the current user
func getUser(c *fiber.Ctx) error {
	// Get the authenticated user from the context
	user := middleware.GetAuthUser(c)
	if user == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get the email from the query
	email := c.Query("email")
	if email == "" || email != user.Email {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get the user from the database
	var dbUser models.User
	if err := models.DB.Where("email = ?", email).First(&dbUser).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	return c.JSON(dbUser)
}
