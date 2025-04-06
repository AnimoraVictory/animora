package routes

import (
	"github.com/aki-13627/animalia/backend-go/internal/injector"
	"github.com/labstack/echo/v4"
)

func SetupCommentRoutes(app *echo.Echo) {
	commentHandler := injector.InjectCommentHandler()
	commentGroup := app.Group("/comments")

	// Create a new comment
	commentGroup.POST("/new", commentHandler.Create)

	// Delete a comment
	commentGroup.DELETE("/delete", commentHandler.Delete)

	// Get comments for a post
	commentGroup.GET("/post", commentHandler.GetByPostId)
}
