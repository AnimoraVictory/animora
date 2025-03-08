package routes

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/htanos/animalia/backend-go/internal/auth"
	"github.com/htanos/animalia/backend-go/internal/models"
	"gorm.io/gorm"
)

// SetupAuthRoutes sets up the auth routes
func SetupAuthRoutes(app *fiber.App) {
	authGroup := app.Group("/auth")

	// Verify email
	authGroup.Post("/verify-email", verifyEmail)

	// Sign in
	authGroup.Post("/signin", signIn)

	// Sign up
	authGroup.Post("/signup", signUp)

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
	// リクエストボディのパース
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
	if err := auth.VerifyEmail(req.Email, req.Code); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "確認コードが無効です",
		})
	}

	return c.JSON(fiber.Map{
		"message": "メール認証が完了しました",
	})
}

// signUp signs a user up: ユーザーを Cognito に追加し、その後 dbUser を作成
func signUp(c *fiber.Ctx) error {
	// リクエストボディのパース
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Name     string `json:"name"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// 入力値の検証
	if req.Email == "" || req.Password == "" || req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "情報が不足しています",
		})
	}

	// DB に同じメールアドレスのユーザーが既に存在しないかチェック
	existingUser, err := models.GetUserByEmail(models.DB, req.Email)
	// 存在していた場合はエラー
	if err == nil && existingUser != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "このメールアドレスは既に登録されています",
		})
	}
	// もし他の DB エラーがあれば、そのまま返す
	if err != nil && err != gorm.ErrRecordNotFound {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "データベースエラー",
		})
	}

	// Cognito にユーザー登録を実施
	// auth.SignUp は、内部で Cognito の API を呼び出し、2 つの値（結果とエラー）を返す想定です
	dbUser, err := auth.SignUp(req.Name, req.Email, req.Password)
	if err != nil {
		log.Printf("Cognito signUp error: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ユーザー登録に失敗しました",
		})
	}
	
	// サインアップ成功時のレスポンスを返す
	return c.JSON(fiber.Map{
		"message": "アカウントが作成されました",
		"user":    dbUser,
	})
}

// signIn signs a user in
// signIn signs a user in
func signIn(c *fiber.Ctx) error {
	// リクエストボディのパース
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// リクエスト内容の検証
	if req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "lack of information",
		})
	}

	// サインイン処理 (Cognito等)
	result, err := auth.SignIn(req.Email, req.Password)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "failed to signin",
		})
	}

	// データベースからユーザー情報を取得
	// models.GetUserByEmail は、models.DB と email を受け取り、ユーザー情報を返す実装とします。
	dbUser, err := models.GetUserByEmail(models.DB, req.Email)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "ユーザー情報を取得できません",
		})
	}

	// Cookie を使用せず、トークンを JSON レスポンスで返す
	return c.JSON(fiber.Map{
		"message": "ログイン成功",
		"user": fiber.Map{
			"id":    dbUser.ID,
			"email": dbUser.Email,
			"name":  dbUser.Name,
		},
		"accessToken":  *result.AuthenticationResult.AccessToken,
		"idToken":      *result.AuthenticationResult.IdToken,
		"refreshToken": *result.AuthenticationResult.RefreshToken,
	})
}


// refreshToken refreshes a user's authentication tokens
func refreshToken(c *fiber.Ctx) error {
	// リクエストボディのパース
	var req struct {
		RefreshToken string `json:"refreshToken"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// リクエスト内容の検証
	if req.RefreshToken == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "リフレッシュトークンがありません",
		})
	}

	// トークン更新処理
	result, err := auth.RefreshToken(req.RefreshToken)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "トークンの更新に失敗しました",
		})
	}

	// 新しいトークンを JSON レスポンスで返す
	response := fiber.Map{
		"message":     "トークン更新成功",
		"accessToken": *result.AuthenticationResult.AccessToken,
		"idToken":     *result.AuthenticationResult.IdToken,
	}
	if result.AuthenticationResult.RefreshToken != nil {
		response["refreshToken"] = *result.AuthenticationResult.RefreshToken
	}

	return c.JSON(response)
}

// getMe gets the current user's information
func getMe(c *fiber.Ctx) error {
	// Authorization ヘッダーからトークンを取得
	authHeader := c.Get("Authorization")
	if authHeader == "" || len(authHeader) < 8 || authHeader[:7] != "Bearer " {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "トークンがありません",
		})
	}
	accessToken := authHeader[7:]

	// Cognito のユーザー情報を取得する（claims ではなく）
	cognitoUser, err := auth.GetUser(accessToken)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cognito からユーザー情報を取得できません",
		})
	}

	// cognitoUser から email を取得する
	var email string
	for _, attr := range cognitoUser.UserAttributes {
		if *attr.Name == "email" {
			email = *attr.Value
			break
		}
	}
	if email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cognito ユーザー情報にメールアドレスが含まれていません",
		})
	}

	// データベースからユーザー情報を取得（models.DB はグローバル変数、または依存性注入済み）
	dbUser, err := models.GetUserByEmail(models.DB, email)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "ユーザー情報が見つかりません",
		})
	}

	return c.JSON(fiber.Map{
		"user": dbUser,
	})
}
// signOut signs a user out
func signOut(c *fiber.Ctx) error {
	// Authorization ヘッダーからトークンを取得
	authHeader := c.Get("Authorization")
	if authHeader == "" || len(authHeader) < 8 || authHeader[:7] != "Bearer " {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "トークンがありません",
		})
	}
	accessToken := authHeader[7:]

	// サインアウト処理
	if err := auth.SignOut(accessToken); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ログアウトに失敗しました",
		})
	}

	// JSON レスポンスで結果を返す
	return c.JSON(fiber.Map{
		"message": "ログアウトしました",
	})
}

// getSession gets the current user's session
func getSession(c *fiber.Ctx) error {
	// Authorization ヘッダーからIDトークンを取得
	authHeader := c.Get("Authorization")
	if authHeader == "" || len(authHeader) < 8 || authHeader[:7] != "Bearer " {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "トークンがありません",
		})
	}
	idToken := authHeader[7:]

	// トークンの検証
	user, err := auth.VerifyToken(idToken)
	if err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Invalid token",
		})
	}

	return c.JSON(user)
}