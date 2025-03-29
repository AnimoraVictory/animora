package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
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
			log.Error("Failed to get user: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
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
					log.Error("Failed to delete image: %v", err)
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"error": "既存画像の削除に失敗しました",
					})
				}
			}

			newImageKey, err = h.storageUsecase.UploadImage(file, "profile")
			if err != nil {
				log.Error("Failed to upload image: %v", err)
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "新しい画像のアップロードに失敗しました",
				})
			}
		} else {
			// 画像ファイルが送られてこなかった場合は既存の画像キーを維持する
			newImageKey = user.IconImageKey
		}

		// ユーザー情報を更新（画像キーは新しい画像があればその値、なければ既存のもの）
		if err := h.userUsecase.Update(id, name, bio, newImageKey); err != nil {
			log.Error("Failed to update user: %v", err)
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

func (h *UserHandler) Follow() fiber.Handler {
	return func(c *fiber.Ctx) error {
		followerId, followedId := c.Query("followerId"), c.Query("followedId")

		if followerId == "" || followedId == "" {
			log.Error("Failed to follow: followerId or followedId is empty")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "情報が不足しています"})
		}
		if err := h.userUsecase.Follow(followerId, followedId); err != nil {
			log.Error("Failed to follow: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "フォローに失敗しました",
			})
		}

		return c.JSON(fiber.Map{
			"message": "フォローしました",
		})
	}
}

func (h *UserHandler) GetFollowsCount() fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Query("id")
		if id == "" {
			log.Error("Failed to get follows count: id is empty")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ユーザーIDが必要です"})
		}
		count, err := h.userUsecase.FollowsCount(id)
		if err != nil {
			log.Error("Failed to get follows count: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "フォロー中数の取得に失敗しました"})
		}
		return c.JSON(fiber.Map{"followed_count": count})
	}
}

func (h *UserHandler) GetFollowerCount() fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Query("id")
		if id == "" {
			log.Error("Failed to get follower count: id is empty")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ユーザーIDが必要です"})
		}
		count, err := h.userUsecase.FollowerCount(id)
		if err != nil {
			log.Error("Failed to get follower count: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "フォロワー数の取得に失敗しました"})
		}
		return c.JSON(fiber.Map{"follower_count": count})
	}
}

func (h *UserHandler) GetFollowsUsers() fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Query("id")
		if id == "" {
			log.Error("Failed to get follows users: id is empty")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ユーザーIDが必要です"})
		}
		users, err := h.userUsecase.FollowsUsers(id)
		if err != nil {
			log.Error("Failed to get follows users: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "フォロー中のユーザー一覧取得に失敗しました"})
		}
		return c.JSON(fiber.Map{"followed_users": users})
	}
}

func (h *UserHandler) GetFollowerUsers() fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Query("id")
		if id == "" {
			log.Error("Failed to get follower users: id is empty")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ユーザーIDが必要です"})
		}
		users, err := h.userUsecase.FollowerUsers(id)
		if err != nil {
			log.Error("Failed to get follower users: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "フォロワーの取得に失敗しました"})
		}
		return c.JSON(fiber.Map{"follower_users": users})
	}
}
