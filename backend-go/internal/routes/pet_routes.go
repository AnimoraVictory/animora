package routes

import (
	"github.com/aki-13627/animalia/backend-go/internal/injector"
	"github.com/labstack/echo/v4"
)

// SetupPetRoutes sets up the pet routes
func SetupPetRoutes(app *echo.Echo) {
	petHandler := injector.InjectPetHandler()
	authMiddleware := injector.InjectAuthMiddleware()
	petGroup := app.Group("/pets", authMiddleware.Handler)

	// Get pets by owner ID
	petGroup.GET("/owner", petHandler.GetByOwner)

	// Create a new pet
	petGroup.POST("/new", petHandler.Create)

	petGroup.PUT("/update", petHandler.Update)

	petGroup.DELETE("/delete", petHandler.Delete)
}
