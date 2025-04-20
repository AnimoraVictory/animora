package routes

import (
	"github.com/aki-13627/animalia/backend-go/internal/injector"
	"github.com/labstack/echo/v4"
)

func SetupLikeRoutes(app *echo.Echo) {
	likeHandler := injector.InjectLikeHandler()
	likeGroup := app.Group("/likes")

	// Create a new like
	likeGroup.POST("/new", likeHandler.Create)

	// Delete a like
	likeGroup.DELETE("/delete", likeHandler.Delete)

	// Count likes for a post
	likeGroup.GET("/count", likeHandler.Count)
}
