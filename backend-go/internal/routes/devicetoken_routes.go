package routes

import (
	"github.com/aki-13627/animalia/backend-go/internal/injector"
	"github.com/labstack/echo/v4"
)

func SetupDeviceTokenRoutes(app *echo.Echo) {
	deviceTokenHandler := injector.InjectDeviceTokenHandler()
	authMiddleware := injector.InjectAuthMiddleware()

	deviceTokenGroup := app.Group("/devicetokens")

	deviceTokenGroup.POST("/upsert", deviceTokenHandler.Create, authMiddleware.Handler)
}
