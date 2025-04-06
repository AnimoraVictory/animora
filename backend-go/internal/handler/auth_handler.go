package handler

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/aki-13627/animalia/backend-go/internal/usecase"
	"github.com/labstack/echo/v4"
	"github.com/labstack/gommon/log"
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

func (h *AuthHandler) SignIn(c echo.Context) error {
	// リクエストボディから email と password を取得
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.Bind(&req); err != nil {
		log.Errorf("Failed to parse request body: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "リクエストのパースに失敗しました",
		})
	}

	// サインイン処理の実行
	result, err := h.authUsecase.SignIn(req.Email, req.Password)
	if err != nil {
		log.Errorf("Failed to sign in: %v", err)
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": fmt.Sprintf("サインインに失敗しました: %v", err),
		})
	}

	// ユーザー情報の取得
	user, err := h.userUsecase.GetByEmail(req.Email)

	// IconImageKey が空の場合は URL を生成せずにレスポンスを返す
	if err != nil {
		log.Errorf("Failed to get user by email: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "ユーザー情報の取得に失敗しました",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":      "ログイン成功",
		"user":         user,
		"accessToken":  *result.AuthenticationResult.AccessToken,
		"idToken":      *result.AuthenticationResult.IdToken,
		"refreshToken": *result.AuthenticationResult.RefreshToken,
	})
}

func (h *AuthHandler) RefreshToken(c echo.Context) error {
	// リクエストボディからリフレッシュトークンを取得
	var req struct {
		RefreshToken string `json:"refreshToken"`
	}
	if err := c.Bind(&req); err != nil {
		log.Errorf("Failed to parse request body: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "リクエストのパースに失敗しました",
		})
	}
	if req.RefreshToken == "" {
		log.Error("Failed to refresh token: refreshToken is empty")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "リフレッシュトークンが不足しています",
		})
	}

	// リフレッシュトークンの更新処理
	result, err := h.authUsecase.RefreshToken(req.RefreshToken)
	if err != nil {
		log.Errorf("Failed to refresh token: %v", err)
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": fmt.Sprintf("リフレッシュトークンの更新に失敗しました: %v", err),
		})
	}

	// レスポンスの作成
	resp := models.RefreshTokenResponse{
		AccessToken: *result.AuthenticationResult.AccessToken,
		IdToken:     *result.AuthenticationResult.IdToken,
	}

	return c.JSON(http.StatusOK, resp)
}

func (h *AuthHandler) VerifyEmail(c echo.Context) error {
	var req struct {
		Email string `json:"email"`
		Code  string `json:"code"`
	}
	if err := c.Bind(&req); err != nil {
		log.Errorf("Failed to parse request body: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "Invalid request body",
		})
	}

	// リクエスト内容の検証
	if req.Email == "" || req.Code == "" {
		log.Error("Failed to verify email: email or code is empty")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "lack of information",
		})
	}

	// メール認証の実施
	if err := h.authUsecase.VerifyEmail(req.Email, req.Code); err != nil {
		log.Errorf("Failed to verify email: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "確認コードが無効です",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "メール認証が完了しました",
	})
}

func (h *AuthHandler) SignUp(c echo.Context) error {
	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.Bind(&req); err != nil {
		log.Errorf("Failed to parse request body: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "Invalid request body",
		})
	}

	// Validate request
	if req.Name == "" || req.Email == "" || req.Password == "" {
		log.Error("Failed to sign up: information is missing")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "情報が不足しています",
		})
	}

	if err := h.authUsecase.CreateUser(req.Name, req.Email, req.Password); err != nil {
		log.Errorf("Failed to create user: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "ユーザーの作成に失敗しました",
		})
	}

	user, err := h.userUsecase.CreateUser(req.Name, req.Email)
	if err != nil {
		log.Errorf("Failed to create user: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "ユーザーの作成に失敗しました",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "ユーザーが作成されました",
		"user":    user,
	})
}

func (h *AuthHandler) GetMe(c echo.Context) error {
	// リクエストヘッダーから Authorization トークンを取得
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		log.Error("Failed to get user email: token is empty")
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "アクセストークンが必要です",
		})
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	email, err := h.authUsecase.GetUserEmail(tokenString)
	if err != nil {
		log.Errorf("Failed to get user email: %v", err)
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "無効なアクセストークンです",
		})
	}

	userResponse, err := h.userUsecase.GetByEmail(email)
	if err != nil {
		log.Errorf("Failed to get user: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": fmt.Sprintf("ユーザー情報の取得に失敗しました: %v", err),
		})
	}
	return c.JSON(http.StatusOK, userResponse)
}

func (h *AuthHandler) SignOut(c echo.Context) error {
	// Authorization ヘッダーからトークンを取得
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" || len(authHeader) < 8 || authHeader[:7] != "Bearer " {
		log.Error("Failed to sign out: token is empty")
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "トークンがありません",
		})
	}
	accessToken := authHeader[7:]

	if err := h.authUsecase.SignOut(accessToken); err != nil {
		log.Errorf("Failed to sign out: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "ログアウトに失敗しました",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "ログアウトしました",
	})
}

func (h *AuthHandler) GetSession(c echo.Context) error {
	// Authorization ヘッダーからIDトークンを取得
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" || len(authHeader) < 8 || authHeader[:7] != "Bearer " {
		log.Error("Failed to get session: token is empty")
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "トークンがありません",
		})
	}
	idToken := authHeader[7:]

	user, err := h.authUsecase.GetUserEmail(idToken)
	if err != nil {
		log.Errorf("Failed to get session: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "ユーザーの取得に失敗しました",
		})
	}

	return c.JSON(http.StatusOK, user)
}
