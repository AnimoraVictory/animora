package handler

import (
	"net/http"

	"github.com/aki-13627/animalia/backend-go/internal/usecase"
	"github.com/labstack/echo/v4"
	"github.com/labstack/gommon/log"
)

type DeviceTokenHandler struct {
	deviceTokenUsecase usecase.DeviceTokenUsecase
}

func NewDeviceTokenHandler(deviceTokenUsecase usecase.DeviceTokenUsecase) *DeviceTokenHandler {
	return &DeviceTokenHandler{
		deviceTokenUsecase: deviceTokenUsecase,
	}
}

func (h *DeviceTokenHandler) Create(c echo.Context) error {
	userID := c.QueryParam("userId")
	deviceID := c.QueryParam("deviceId")
	token := c.QueryParam("token")
	platform := c.QueryParam("platform")

	if userID == "" || deviceID == "" || token == "" || platform == "" {
		log.Errorf("Params not enough: %v")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "Params not enough",
		})
	}

	err := h.deviceTokenUsecase.Create(userID, deviceID, token, platform)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "deviceToken created"})
}

func (h *DeviceTokenHandler) Update(c echo.Context) error {
	userID := c.QueryParam("userId")
	deviceID := c.QueryParam("deviceId")
	token := c.QueryParam("token")
	if userID == "" || deviceID == "" || token == "" {
		log.Errorf("Params not enough: %v")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "Params not enough",
		})
	}
	err := h.deviceTokenUsecase.Update(userID, deviceID, token)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "deviceToken created"})
}
