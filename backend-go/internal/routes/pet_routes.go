package routes

import (
	"github.com/aki-13627/animalia/backend-go/internal/injector"
	"github.com/gofiber/fiber/v2"
)

// SetupPetRoutes sets up the pet routes
func SetupPetRoutes(app *fiber.App) {
	petHandler := injector.InjectPetHandler()
	petGroup := app.Group("/pets")

	// Get pets by owner ID
	petGroup.Get("/owner", petHandler.GetByOwner())

	// Create a new pet
	petGroup.Post("/new", petHandler.Create())

	petGroup.Put("/update", petHandler.Update())

	petGroup.Delete("/delete", petHandler.Delete())
}
