package handler

import (
	"net/http"

	"github.com/aki-13627/animalia/backend-go/internal/usecase"
	"github.com/labstack/echo/v4"
	"github.com/labstack/gommon/log"
)

type UserHandler struct {
	userUsecase    usecase.UserUsecase
	storageUsecase usecase.StorageUsecase
}

func NewUserHandler(userUsecase usecase.UserUsecase, storageUsecase usecase.StorageUsecase) *UserHandler {
	return &UserHandler{
		userUsecase:    userUsecase,
		storageUsecase: storageUsecase,
	}
}

func (h *UserHandler) UpdateUser(c echo.Context) error {
	// クエリからユーザーIDを取得
	id := c.QueryParam("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "userId is required",
		})
	}

	form, err := c.MultipartForm()
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "Invalid form data",
		})
	}

	// ユーザー情報（name, bio）の取得
	name := form.Value["name"][0]
	bio := form.Value["bio"][0]

	// ユーザー情報の取得（例: 現在の画像キーを取得するため）
	user, err := h.userUsecase.GetById(id)
	if err != nil {
		log.Errorf("Failed to get user: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "ユーザー情報の取得に失敗しました",
		})
	}

	// 画像ファイルが存在するか確認
	file, fileErr := c.FormFile("image")
	var newImageKey string
	if fileErr == nil {
		// 画像ファイルが送られてきた場合、古い画像があれば削除して新しい画像をアップロードする
		if user.IconImageKey != "" {
			if err := h.storageUsecase.DeleteImage(user.IconImageKey); err != nil {
				log.Errorf("Failed to delete image: %v", err)
				return c.JSON(http.StatusInternalServerError, map[string]interface{}{
					"error": "既存画像の削除に失敗しました",
				})
			}
		}

		newImageKey, err = h.storageUsecase.UploadImage(file, "profile")
		if err != nil {
			log.Errorf("Failed to upload image: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"error": "新しい画像のアップロードに失敗しました",
			})
		}
	} else {
		// 画像ファイルが送られてこなかった場合は既存の画像キーを維持する
		newImageKey = user.IconImageKey
	}

	// ユーザー情報を更新（画像キーは新しい画像があればその値、なければ既存のもの）
	if err := h.userUsecase.Update(id, name, bio, newImageKey); err != nil {
		log.Errorf("Failed to update user: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "プロフィール更新に失敗しました",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":   "プロフィールが更新されました",
		"image_key": newImageKey,
	})
}

func (h *UserHandler) Follow(c echo.Context) error {
	followerId, followedId := c.QueryParam("followerId"), c.QueryParam("followedId")

	if followerId == "" || followedId == "" {
		log.Error("Failed to follow: followerId or followedId is empty")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "情報が不足しています"})
	}
	if err := h.userUsecase.Follow(followerId, followedId); err != nil {
		log.Errorf("Failed to follow: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "フォローに失敗しました",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "フォローしました",
	})
}

func (h *UserHandler) GetFollowsCount(c echo.Context) error {
	id := c.QueryParam("id")
	if id == "" {
		log.Error("Failed to get follows count: id is empty")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "ユーザーIDが必要です"})
	}
	count, err := h.userUsecase.FollowsCount(id)
	if err != nil {
		log.Errorf("Failed to get follows count: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"error": "フォロー中数の取得に失敗しました"})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"followed_count": count})
}

func (h *UserHandler) GetFollowerCount(c echo.Context) error {
	id := c.QueryParam("id")
	if id == "" {
		log.Error("Failed to get follower count: id is empty")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "ユーザーIDが必要です"})
	}
	count, err := h.userUsecase.FollowerCount(id)
	if err != nil {
		log.Errorf("Failed to get follower count: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"error": "フォロワー数の取得に失敗しました"})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"follower_count": count})
}

func (h *UserHandler) GetFollowsUsers(c echo.Context) error {
	id := c.QueryParam("id")
	if id == "" {
		log.Error("Failed to get follows users: id is empty")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "ユーザーIDが必要です"})
	}
	users, err := h.userUsecase.FollowingUsers(id)
	if err != nil {
		log.Errorf("Failed to get follows users: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"error": "フォロー中のユーザー一覧取得に失敗しました"})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"followed_users": users})
}

func (h *UserHandler) GetFollowerUsers(c echo.Context) error {
	id := c.QueryParam("id")
	if id == "" {
		log.Error("Failed to get follower users: id is empty")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "ユーザーIDが必要です"})
	}
	users, err := h.userUsecase.Followers(id)
	if err != nil {
		log.Errorf("Failed to get follower users: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"error": "フォロワーの取得に失敗しました"})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"follower_users": users})
}
