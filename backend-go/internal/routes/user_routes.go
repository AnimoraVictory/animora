package routes

import (
	"github.com/aki-13627/animalia/backend-go/internal/injector"
	"github.com/gofiber/fiber/v2"
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
