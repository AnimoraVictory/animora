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
	userGroup.Get("/followed_count", userHandler.GetFollowedCount())
	userGroup.Get("/follower_users", userHandler.GetFollowerUsers())
	userGroup.Get("/followed_users", userHandler.GetFollowedUsers())

}
