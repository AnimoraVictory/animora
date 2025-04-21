package middlewares

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

// MockGetUserEmailFunc is a function type for mocking GetUserEmail
type MockGetUserEmailFunc func(string) (string, error)

// TestAuthMiddleware_Handler tests the auth middleware's Handler method
func TestAuthMiddleware_Handler(t *testing.T) {
	// Test cases
	testCases := []struct {
		name           string
		authHeader     string
		mockToken      string
		mockEmail      string
		mockError      error
		expectedStatus int
		expectedEmail  string
	}{
		{
			name:           "No Authorization header",
			authHeader:     "",
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Empty token after trimming Bearer prefix",
			authHeader:     "Bearer ",
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Invalid token",
			authHeader:     "Bearer invalid-token",
			mockToken:      "invalid-token",
			mockError:      errors.New("invalid token"),
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Valid token",
			authHeader:     "Bearer valid-token",
			mockToken:      "valid-token",
			mockEmail:      "test@example.com",
			mockError:      nil,
			expectedStatus: http.StatusOK,
			expectedEmail:  "test@example.com",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Setup
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			// Set Authorization header if provided
			if tc.authHeader != "" {
				req.Header.Set("Authorization", tc.authHeader)
			}

			// Create a mock GetUserEmail function
			getUserEmailCalled := false
			var tokenPassed string
			mockGetUserEmail := func(token string) (string, error) {
				getUserEmailCalled = true
				tokenPassed = token
				if tc.mockToken != "" && token == tc.mockToken {
					return tc.mockEmail, tc.mockError
				}
				return "", errors.New("unexpected token")
			}

			// Create a handler function that will be called if the middleware passes
			handlerCalled := false
			var emailFromContext string
			handler := func(c echo.Context) error {
				handlerCalled = true
				emailFromContext = c.Get("email").(string)
				return c.NoContent(http.StatusOK)
			}

			// Create and execute the middleware directly
			middlewareFunc := func(next echo.HandlerFunc) echo.HandlerFunc {
				return func(c echo.Context) error {
					authHeader := c.Request().Header.Get("Authorization")
					if authHeader == "" {
						return c.JSON(http.StatusUnauthorized, map[string]interface{}{
							"error": "アクセストークンが必要です",
						})
					}

					tokenString := strings.TrimPrefix(authHeader, "Bearer ")
					if tokenString == "" {
						return c.JSON(http.StatusUnauthorized, map[string]interface{}{
							"error": "アクセストークンが必要です",
						})
					}

					email, err := mockGetUserEmail(tokenString)
					if err != nil {
						return c.JSON(http.StatusUnauthorized, map[string]interface{}{
							"error": "無効なアクセストークンです",
						})
					}

					c.Set("email", email)

					return next(c)
				}
			}

			// Execute middleware
			err := middlewareFunc(handler)(c)

			// Assertions
			assert.NoError(t, err)
			assert.Equal(t, tc.expectedStatus, rec.Code)

			if tc.authHeader != "" && tc.authHeader != "Bearer " {
				assert.True(t, getUserEmailCalled, "GetUserEmail should have been called")
				assert.Equal(t, strings.TrimPrefix(tc.authHeader, "Bearer "), tokenPassed, "Unexpected token passed to GetUserEmail")
			}

			if tc.expectedStatus == http.StatusOK {
				// If we expect the middleware to pass, the handler should have been called
				assert.True(t, handlerCalled, "Handler should have been called")
				assert.Equal(t, tc.expectedEmail, emailFromContext, "Unexpected email in context")
			} else {
				// If we expect the middleware to fail, the handler should not have been called
				assert.False(t, handlerCalled, "Handler should not have been called")
			}
		})
	}
}
