package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/htanos/animalia/backend-go/internal/injector"
)

func SetupUserRoutes(app *fiber.App) {
	userHandler := injector.InjectUserHandler()
	userGroup := app.Group("/users")

	userGroup.Put("/update", userHandler.UpdateUser())
}
