package routes

import (
	"github.com/aki-13627/animalia/backend-go/internal/injector"
	"github.com/gofiber/fiber/v2"
)

// SetupPostRoutes sets up the post routes
func SetupPostRoutes(app *fiber.App) {
	postHandler := injector.InjectPostHandler()
	postGroup := app.Group("/posts")

	// Get all posts
	postGroup.Get("/", postHandler.GetAllPosts())

	// Create a new post
	postGroup.Post("/", postHandler.CreatePost())

	postGroup.Get("/user", postHandler.GetPostsByUser())
}
