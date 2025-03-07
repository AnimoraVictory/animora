package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/htanos/animalia/backend-go/internal/auth"
)

// SetupAuthRoutes sets up the auth routes
func SetupAuthRoutes(app *fiber.App) {
	authGroup := app.Group("/auth")

	// Verify email
	authGroup.Post("/verify-email", verifyEmail)

	// Sign in
	authGroup.Post("/signin", signIn)

	// Refresh token
	authGroup.Post("/refresh", refreshToken)

	// Get current user
	authGroup.Get("/me", getMe)

	// Sign out
	authGroup.Post("/signout", signOut)

	// Get session
	authGroup.Get("/session", getSession)
}

// verifyEmail verifies a user's email address
func verifyEmail(c *fiber.Ctx) error {
	// Parse request body
	var req struct {
		Email string `json:"email"`
		Code  string `json:"code"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate request
	if req.Email == "" || req.Code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "lack of information",
		})
	}

	// Verify email
	if err := auth.VerifyEmail(req.Email, req.Code); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "確認コードが無効です",
		})
	}

	return c.JSON(fiber.Map{
		"message": "メール認証が完了しました",
	})
}

// signIn signs a user in
func signIn(c *fiber.Ctx) error {
	// Parse request body
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate request
	if req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "lack of information",
		})
	}

	// Sign in
	result, err := auth.SignIn(req.Email, req.Password)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "failed to signin",
		})
	}

	// Set cookies
	c.Cookie(&fiber.Cookie{
		Name:     "accessToken",
		Value:    *result.AuthenticationResult.AccessToken,
		HTTPOnly: true,
		Secure:   true,
		SameSite: "None",
		Path:     "/",
	})
	c.Cookie(&fiber.Cookie{
		Name:     "idToken",
		Value:    *result.AuthenticationResult.IdToken,
		HTTPOnly: true,
		Secure:   true,
		SameSite: "None",
		Path:     "/",
	})
	c.Cookie(&fiber.Cookie{
		Name:     "refreshToken",
		Value:    *result.AuthenticationResult.RefreshToken,
		HTTPOnly: true,
		Secure:   true,
		SameSite: "None",
		Path:     "/",
	})

	return c.JSON(fiber.Map{
		"message": "ログイン成功",
		"user": fiber.Map{
			"email": req.Email,
		},
	})
}

// refreshToken refreshes a user's authentication tokens
func refreshToken(c *fiber.Ctx) error {
	// Parse request body
	var req struct {
		RefreshToken string `json:"refreshToken"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate request
	if req.RefreshToken == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "リフレッシュトークンがありません",
		})
	}

	// Refresh token
	result, err := auth.RefreshToken(req.RefreshToken)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "トークンの更新に失敗しました",
		})
	}

	// Set cookies
	c.Cookie(&fiber.Cookie{
		Name:     "accessToken",
		Value:    *result.AuthenticationResult.AccessToken,
		HTTPOnly: true,
		Secure:   true,
		SameSite: "None",
		Path:     "/",
	})
	c.Cookie(&fiber.Cookie{
		Name:     "idToken",
		Value:    *result.AuthenticationResult.IdToken,
		HTTPOnly: true,
		Secure:   true,
		SameSite: "None",
		Path:     "/",
	})
	if result.AuthenticationResult.RefreshToken != nil {
		c.Cookie(&fiber.Cookie{
			Name:     "refreshToken",
			Value:    *result.AuthenticationResult.RefreshToken,
			HTTPOnly: true,
			Secure:   true,
			SameSite: "None",
			Path:     "/",
		})
	}

	return c.JSON(fiber.Map{
		"message": "トークン更新成功",
	})
}

// getMe gets the current user's information
func getMe(c *fiber.Ctx) error {
	// Get the Authorization header
	authHeader := c.Get("Authorization")
	if authHeader == "" || len(authHeader) < 8 || authHeader[:7] != "Bearer " {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "トークンがありません",
		})
	}

	// Extract the token
	accessToken := authHeader[7:]

	// Get user information
	userInfo, err := auth.GetUser(accessToken)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ユーザー情報を取得できません",
		})
	}

	return c.JSON(fiber.Map{
		"user": userInfo,
	})
}

// signOut signs a user out
func signOut(c *fiber.Ctx) error {
	// Get the access token from the cookie
	accessToken := c.Cookies("accessToken")
	if accessToken == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized - No token provided",
		})
	}

	// Sign out
	if err := auth.SignOut(accessToken); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ログアウトに失敗しました",
		})
	}

	// Clear cookies
	c.Cookie(&fiber.Cookie{
		Name:     "accessToken",
		Value:    "",
		HTTPOnly: true,
		Secure:   true,
		SameSite: "None",
		Path:     "/",
		MaxAge:   -1,
	})
	c.Cookie(&fiber.Cookie{
		Name:     "idToken",
		Value:    "",
		HTTPOnly: true,
		Secure:   true,
		SameSite: "None",
		Path:     "/",
		MaxAge:   -1,
	})
	c.Cookie(&fiber.Cookie{
		Name:     "refreshToken",
		Value:    "",
		HTTPOnly: true,
		Secure:   true,
		SameSite: "None",
		Path:     "/",
		MaxAge:   -1,
	})

	return c.JSON(fiber.Map{
		"message": "ログアウトしました",
	})
}

// getSession gets the current user's session
func getSession(c *fiber.Ctx) error {
	// Get the ID token from the cookie
	idToken := c.Cookies("idToken")
	if idToken == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized - No token provided",
		})
	}

	// Verify the token
	user, err := auth.VerifyToken(idToken)
	if err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Invalid token",
		})
	}

	return c.JSON(user)
}
