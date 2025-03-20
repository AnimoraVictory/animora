package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/htanos/animalia/backend-go/internal/usecase"
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

func (h *UserHandler) UpdateUser() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// クエリからユーザーIDを取得
		id := c.Query("id")
		if id == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "userId is required",
			})
		}

		form, err := c.MultipartForm()
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid form data",
			})
		}

		// ユーザー情報（name, bio）の取得
		name := form.Value["name"][0]
		bio := form.Value["bio"][0]

		// ユーザー情報の取得（例: 現在の画像キーを取得するため）
		user, err := h.userUsecase.GetById(id)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "ユーザー情報の取得に失敗しました",
			})
		}

		// 古い画像があれば削除する
		if user.IconImageKey != "" {
			if err := h.storageUsecase.DeleteImage(user.IconImageKey); err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "既存画像の削除に失敗しました",
				})
			}
		}

		// 新しい画像ファイルの取得
		file, err := c.FormFile("image")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Image file is required",
			})
		}

		// 新しい画像をアップロードする
		newImageKey, err := h.storageUsecase.UploadImage(file, "profile")
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "新しい画像のアップロードに失敗しました",
			})
		}

		// ユーザー情報を更新（新しい画像キーも含む）
		if err := h.userUsecase.Update(id, name, bio, newImageKey); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "プロフィール更新に失敗しました",
			})
		}

		return c.JSON(fiber.Map{
			"message":   "プロフィールが更新されました",
			"image_key": newImageKey,
		})
	}
}
