package routes

import (
	"github.com/aki-13627/animalia/backend-go/internal/injector"
	"github.com/labstack/echo/v4"
)

// SetupPostRoutes sets up the post routes
func SetupPostRoutes(app *echo.Echo) {
	postHandler := injector.InjectPostHandler()
	authMiddleware := injector.InjectAuthMiddleware()
	postGroup := app.Group("/posts", authMiddleware.Handler)

	// get posts for timeline
	postGroup.POST("/timeline", postHandler.GetRecommended)

	postGroup.GET("/all", postHandler.GetAllPosts)

	// Create a new post
	postGroup.POST("/", postHandler.CreatePost)

	// Delete　a post
	postGroup.DELETE("/delete", postHandler.DeletePost)
}
