package routes

import (
	"github.com/aki-13627/animalia/backend-go/internal/injector"
	"github.com/labstack/echo/v4"
)

func SetupReportRoutes(app *echo.Echo) {
	reportHandler := injector.InjectReportHandler()
	authMiddleware := injector.InjectAuthMiddleware()
	reportGrout := app.Group("/reports", authMiddleware.Handler)

	reportGrout.POST("/send", reportHandler.SendReport, authMiddleware.Handler)
}
