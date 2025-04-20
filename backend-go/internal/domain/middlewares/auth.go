package middlewares

import (
	"net/http"
	"strings"

	"github.com/aki-13627/animalia/backend-go/internal/usecase"
	"github.com/labstack/echo/v4"
	"github.com/labstack/gommon/log"
)

type AuthMiddleware struct {
	authUsecase usecase.AuthUsecase
}

func NewAuthMiddleware(authUsecase usecase.AuthUsecase) *AuthMiddleware {
	return &AuthMiddleware{
		authUsecase: authUsecase,
	}
}

func (m *AuthMiddleware) Handler(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader == "" {
			log.Error("Failed to get user email: token is empty")
			return c.JSON(http.StatusUnauthorized, map[string]interface{}{
				"error": "アクセストークンが必要です",
			})
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == "" {
			log.Error("Failed to trim user token: token is empty")
			return c.JSON(http.StatusUnauthorized, map[string]interface{}{
				"error": "アクセストークンが必要です",
			})
		}

		email, err := m.authUsecase.GetUserEmail(tokenString)
		if err != nil {
			log.Errorf("Failed to get user email from token: %v", err)
			return c.JSON(http.StatusUnauthorized, map[string]interface{}{
				"error": "無効なアクセストークンです",
			})
		}

		c.Set("email", email)

		return next(c)
	}
}
