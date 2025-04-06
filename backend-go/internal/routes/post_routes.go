package routes

import (
	"github.com/aki-13627/animalia/backend-go/internal/injector"
	"github.com/labstack/echo/v4"
)

// SetupPostRoutes sets up the post routes
func SetupPostRoutes(app *echo.Echo) {
	postHandler := injector.InjectPostHandler()
	postGroup := app.Group("/posts")

	// Get all posts
	postGroup.GET("/", postHandler.GetAllPosts)

	// Create a new post
	postGroup.POST("/", postHandler.CreatePost)

	postGroup.GET("/user", postHandler.GetPostsByUser)
}
