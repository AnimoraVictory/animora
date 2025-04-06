package routes

import (
	"github.com/aki-13627/animalia/backend-go/internal/injector"
	"github.com/labstack/echo/v4"
)

func SetupUserRoutes(app *echo.Echo) {
	userHandler := injector.InjectUserHandler()
	userGroup := app.Group("/users")

	userGroup.PUT("/update", userHandler.UpdateUser)

	userGroup.POST("/follow", userHandler.Follow)

	userGroup.GET("/follower_count", userHandler.GetFollowerCount)

	userGroup.GET("/follows_count", userHandler.GetFollowsCount)

	userGroup.GET("/follower_users", userHandler.GetFollowerUsers)

	userGroup.GET("/follows_users", userHandler.GetFollowsUsers)
}
