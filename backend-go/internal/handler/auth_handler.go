package handler

import (
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/htanos/animalia/backend-go/internal/domain/models/responses"
	"github.com/htanos/animalia/backend-go/internal/usecase"
)

type AuthHandler struct {
	authUsecase    usecase.AuthUsecase
	userUsecase    usecase.UserUsecase
	storageUsecase usecase.StorageUsecase
}

func NewAuthHandler(authUsecase usecase.AuthUsecase, userUsecase usecase.UserUsecase, storageUsecase usecase.StorageUsecase) *AuthHandler {
	return &AuthHandler{
		authUsecase:    authUsecase,
		userUsecase:    userUsecase,
		storageUsecase: storageUsecase,
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
		if user.IconImageKey != "" {
			url, err := h.storageUsecase.GetUrl(user.IconImageKey)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": fmt.Sprintf("ユーザーの取得に失敗しました: %v", err),
				})
			}
			userResponse := responses.NewUserResponse(user, url)

			return c.JSON(fiber.Map{
				"message":      "ログイン成功",
				"user":         userResponse,
				"accessToken":  *result.AuthenticationResult.AccessToken,
				"idToken":      *result.AuthenticationResult.IdToken,
				"refreshToken": *result.AuthenticationResult.RefreshToken,
			})
		}

		// IconImageKey が空の場合は URL を生成せずにレスポンスを返す
		userResponse := responses.NewUserResponse(user, "")
		return c.JSON(fiber.Map{
			"message":      "ログイン成功",
			"user":         userResponse,
			"accessToken":  *result.AuthenticationResult.AccessToken,
			"idToken":      *result.AuthenticationResult.IdToken,
			"refreshToken": *result.AuthenticationResult.RefreshToken,
		})
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
		// リクエストヘッダーから Authorization トークンを取得
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "アクセストークンが必要です",
			})
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		email, err := h.authUsecase.GetUserEmail(tokenString)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "無効なアクセストークンです",
			})
		}

		user, err := h.authUsecase.FindByEmail(email)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fmt.Sprintf("ユーザー情報の取得に失敗しました: %v", err),
			})
		}
		// ユーザーのアイコン画像がある場合は URL を取得
		if user.IconImageKey != "" {
			url, err := h.storageUsecase.GetUrl(user.IconImageKey)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": fmt.Sprintf("ユーザー情報の取得に失敗しました: %v", err),
				})
			}
			userResponse := responses.NewUserResponse(user, url)
			return c.JSON(userResponse)
		}

		userResponse := responses.NewUserResponse(user, "")
		return c.JSON(userResponse)
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
