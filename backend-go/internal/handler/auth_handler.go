package handler

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/htanos/animalia/backend-go/internal/domain/models"
	"github.com/htanos/animalia/backend-go/internal/domain/models/responses"
	"github.com/htanos/animalia/backend-go/internal/usecase"
)

type AuthHandler struct {
	authUsecase usecase.AuthUsecase
	userUsecase usecase.UserUsecase
}

func NewAuthHandler(authUsecase usecase.AuthUsecase, userUsecase usecase.UserUsecase) *AuthHandler {
	return &AuthHandler{
		authUsecase: authUsecase,
		userUsecase: userUsecase,
	}
}

func (h *AuthHandler) SignIn() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// リクエストボディから email と password を取得
		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "リクエストのパースに失敗しました",
			})
		}

		// サインイン処理の実行
		result, err := h.authUsecase.SignIn(req.Email, req.Password)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": fmt.Sprintf("サインインに失敗しました: %v", err),
			})
		}

		// ユーザー情報の取得
		user, err := h.authUsecase.FindByEmail(req.Email)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fmt.Sprintf("ユーザーの取得に失敗しました: %v", err),
			})
		}

		// レスポンスの作成
		resp := responses.SignInResponse{
			User:         *user,
			AccessToken:  *result.AuthenticationResult.AccessToken,
			IdToken:      *result.AuthenticationResult.IdToken,
			RefreshToken: *result.AuthenticationResult.RefreshToken,
		}

		return c.JSON(resp)
	}
}

func (h *AuthHandler) RefreshToken() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// リクエストボディからリフレッシュトークンを取得
		var req struct {
			RefreshToken string `json:"refreshToken"`
		}
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "リクエストのパースに失敗しました",
			})
		}
		if req.RefreshToken == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "リフレッシュトークンが不足しています",
			})
		}

		// リフレッシュトークンの更新処理
		result, err := h.authUsecase.RefreshToken(req.RefreshToken)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": fmt.Sprintf("リフレッシュトークンの更新に失敗しました: %v", err),
			})
		}

		// レスポンスの作成
		resp := responses.RefreshTokenResponse{
			AccessToken: *result.AuthenticationResult.AccessToken,
			IdToken:     *result.AuthenticationResult.IdToken,
		}

		return c.JSON(resp)
	}
}

func (h *AuthHandler) VerifyEmail() fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req struct {
			Email string `json:"email"`
			Code  string `json:"code"`
		}
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}

		// リクエスト内容の検証
		if req.Email == "" || req.Code == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "lack of information",
			})
		}

		// メール認証の実施
		if err := h.authUsecase.VerifyEmail(req.Email, req.Code); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "確認コードが無効です",
			})
		}

		return c.JSON(fiber.Map{
			"message": "メール認証が完了しました",
		})
	}
}

func (h *AuthHandler) SignUp() fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req struct {
			Name     string `json:"name"`
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}

		// Validate request
		if req.Name == "" || req.Email == "" || req.Password == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "情報が不足しています",
			})
		}

		if err := h.authUsecase.CreateUser(req.Name, req.Email, req.Password); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "ユーザーの作成に失敗しました",
			})
		}

		user, err := h.userUsecase.CreateUser(req.Name, req.Email)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "ユーザーの作成に失敗しました",
			})
		}

		return c.JSON(fiber.Map{
			"message": "ユーザーが作成されました",
			"user":    user,
		})
	}
}

func (h *AuthHandler) GetMe() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Authorization ヘッダーからトークンを取得
		user := h.getAuthUser(c)
		if user == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "ユーザーが認証されていません",
			})
		}

		return c.JSON(user)
	}
}

func (h *AuthHandler) SignOut() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Authorization ヘッダーからトークンを取得
		authHeader := c.Get("Authorization")
		if authHeader == "" || len(authHeader) < 8 || authHeader[:7] != "Bearer " {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "トークンがありません",
			})
		}
		accessToken := authHeader[7:]

		if err := h.authUsecase.SignOut(accessToken); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "ログアウトに失敗しました",
			})
		}

		return c.JSON(fiber.Map{
			"message": "ログアウトしました",
		})
	}
}

func (h *AuthHandler) GetSession() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Authorization ヘッダーからIDトークンを取得
		authHeader := c.Get("Authorization")
		if authHeader == "" || len(authHeader) < 8 || authHeader[:7] != "Bearer " {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "トークンがありません",
			})
		}
		idToken := authHeader[7:]

		user, err := h.authUsecase.GetUserEmail(idToken)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "ユーザーの取得に失敗しました",
			})
		}

		return c.JSON(user)
	}
}

func (h *AuthHandler) getAuthUser(c *fiber.Ctx) *models.User {
	user, ok := c.Locals("user").(*models.User)
	if !ok {
		return nil
	}
	return user
}
