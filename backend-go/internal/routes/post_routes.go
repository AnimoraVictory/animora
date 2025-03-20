package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/htanos/animalia/backend-go/internal/injector"
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
