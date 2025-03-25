package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/htanos/animalia/backend-go/internal/injector"
)

func SetupUserRoutes(app *fiber.App) {
	userHandler := injector.InjectUserHandler()
	userGroup := app.Group("/users")

	userGroup.Put("/update", userHandler.UpdateUser())
	userGroup.Post("/follow", userHandler.Follow())
	userGroup.Get("/follower_count", userHandler.GetFollowerCount())
	userGroup.Get("/follows_count", userHandler.GetFollowsCount())
	userGroup.Get("/follower_users", userHandler.GetFollowerUsers())
	userGroup.Get("/follows_users", userHandler.GetFollowsUsers())

}
