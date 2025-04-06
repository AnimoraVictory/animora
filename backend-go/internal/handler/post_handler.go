package handler

import (
	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/aki-13627/animalia/backend-go/internal/usecase"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

type PostHandler struct {
	postUsecase    usecase.PostUsecase
	storageUsecase usecase.StorageUsecase
}

func NewPostHandler(postUsecase usecase.PostUsecase, storageUsecase usecase.StorageUsecase) *PostHandler {
	return &PostHandler{
		postUsecase:    postUsecase,
		storageUsecase: storageUsecase,
	}
}

func (h *PostHandler) GetAllPosts() fiber.Handler {
	return func(c *fiber.Ctx) error {
		posts, err := h.postUsecase.GetAllPosts()
		if err != nil {
			log.Error("Failed to get all posts:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		postResponses := make([]*models.PostResponse, len(posts))
		for i, post := range posts {
			imageURL, err := h.storageUsecase.GetUrl(post.ImageKey)
			if err != nil {
				log.Error("Failed to get image URL:", err)
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": err.Error(),
				})
			}
			userImageURL, err := h.storageUsecase.GetUrl(post.Edges.User.IconImageKey)
			if err != nil {
				log.Error("Failed to get user image URL:", err)
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": err.Error(),
				})
			}
			postResponses[i] = models.NewPostResponse(post, imageURL, userImageURL)
		}
		return c.JSON(fiber.Map{
			"posts": postResponses,
		})
	}
}

func (h *PostHandler) GetPostsByUser() fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Query("userId")
		if userID == "" {
			log.Error("Failed to get posts by user: userID is empty")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "User ID is required",
			})
		}
		posts, err := h.postUsecase.GetPostsByUser(userID)
		if err != nil {
			log.Error("Failed to get posts by user: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		postResponses := make([]*models.PostResponse, len(posts))
		for i, post := range posts {
			imageURL, err := h.storageUsecase.GetUrl(post.ImageKey)
			if err != nil {
				log.Error("Failed to get image URL:", err)
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": err.Error(),
				})
			}
			userImageURL, err := h.storageUsecase.GetUrl(post.Edges.User.IconImageKey)
			if err != nil {
				log.Error("Failed to get user image URL:", err)
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": err.Error(),
				})
			}
			postResponses[i] = models.NewPostResponse(post, imageURL, userImageURL)
		}
		return c.JSON(fiber.Map{
			"posts": postResponses,
		})
	}
}

func (h *PostHandler) CreatePost() fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req struct {
			Caption     string  `json:"caption,omitempty"`
			UserId      string  `json:"userId,omitempty"`
			DailyTaskId *string `json:"dailyTaskId,omitempty"`
		}
		if err := c.BodyParser(&req); err != nil {
			log.Error("Failed to create post: invalid request body")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}

		// Validate request
		if req.Caption == "" {
			log.Error("Failed to create post: caption is empty")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "情報が不足しています",
			})
		}

		file, err := c.FormFile("image")
		if err != nil {
			log.Error("Failed to create post: image file is required")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "画像ファイルが必要です",
			})
		}

		// Upload the image
		fileKey, err := h.storageUsecase.UploadImage(file, "posts")
		if err != nil {
			log.Error("Failed to create post: failed to upload image")
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "画像のアップロードに失敗しました",
			})
		}

		post, err := h.postUsecase.CreatePost(req.Caption, req.UserId, fileKey, req.DailyTaskId)
		if err != nil {
			log.Error("Failed to create post: failed to create post")
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "投稿の作成に失敗しました",
			})
		}

		return c.JSON(fiber.Map{
			"message": "投稿が作成されました",
			"post":    post,
		})
	}
}
