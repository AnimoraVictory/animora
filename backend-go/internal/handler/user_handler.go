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
	toId, fromId := c.QueryParam("toId"), c.QueryParam("fromId")

	if toId == "" || fromId == "" {
		log.Error("Failed to follow: followerId or followedId is empty")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "情報が不足しています"})
	}
	if err := h.userUsecase.Follow(toId, fromId); err != nil {
		log.Errorf("Failed to follow: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "フォローに失敗しました",
		})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "フォローしました",
	})
}

func (h *UserHandler) Unfollow(c echo.Context) error {
	toId, fromId := c.QueryParam("toId"), c.QueryParam("fromId")

	if toId == "" || fromId == "" {
		log.Error("Failed to unfollow: followerId or followedId is empty")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "情報が不足しています"})
	}
	if err := h.userUsecase.Unfollow(toId, fromId); err != nil {
		log.Errorf("Failed to unfollow: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "フォロー解除に失敗しました",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "フォロー解除しました",
	})
}

func (h *UserHandler) Block(c echo.Context) error {
	fromId, toId := c.QueryParam("fromId"), c.QueryParam("toId")
	if fromId == "" || toId == "" {
		log.Error("Failed to block: fromId or toId is empty")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "情報が不足しています"})
	}
	if err := h.userUsecase.Block(fromId, toId); err != nil {
		log.Errorf("Failed to block: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "ブロックに失敗しました",
		})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "ブロックしました",
	})
}

func (h *UserHandler) Unblock(c echo.Context) error {
	fromId, toId := c.QueryParam("fromId"), c.QueryParam("toId")
	if fromId == "" || toId == "" {
		log.Error("Failed to unblock: fromId or toId is empty")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "情報が不足しています"})
	}
	if err := h.userUsecase.Unblock(fromId, toId); err != nil {
		log.Errorf("Failed to unblock: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "ブロック解除に失敗しました",
		})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "ブロックを解除しました",
	})
}

func (h *UserHandler) GetUser(c echo.Context) error {
	email := c.QueryParam("email")
	if email == "" {
		log.Error("Failed to get user: id is empty")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "ユーザーIDが必要です"})
	}
	user, err := h.userUsecase.GetByEmail(email)
	if err != nil {
		log.Errorf("Failed to get user: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"error": "ユーザー情報の取得に失敗しました"})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"user": user,
	})
}
