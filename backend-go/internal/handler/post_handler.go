package handler

import (
	"fmt"
	"net/http"

	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/aki-13627/animalia/backend-go/internal/usecase"
	"github.com/labstack/echo/v4"
	"github.com/labstack/gommon/log"
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

func (h *PostHandler) GetAllPosts(c echo.Context) error {
	log.Debug("GetAllPosts")
	fmt.Println("GetAllPosts")
	posts, err := h.postUsecase.GetAllPosts()
	if err != nil {
		log.Errorf("Failed to get all posts: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}
	log.Debug("GetAllPosts: posts", posts)
	postResponses := make([]*models.PostResponse, len(posts))
	for i, post := range posts {
		imageURL, err := h.storageUsecase.GetUrl(post.ImageKey)
		if err != nil {
			log.Errorf("Failed to get image URL: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"error": err.Error(),
			})
		}
		userImageURL, err := h.storageUsecase.GetUrl(post.Edges.User.IconImageKey)
		if err != nil {
			log.Errorf("Failed to get user image URL: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"error": err.Error(),
			})
		}
		postResponses[i] = models.NewPostResponse(post, imageURL, userImageURL)
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"posts": postResponses,
	})
}

func (h *PostHandler) GetPostsByUser(c echo.Context) error {
	userID := c.QueryParam("userId")
	if userID == "" {
		log.Error("Failed to get posts by user: userID is empty")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "User ID is required",
		})
	}
	posts, err := h.postUsecase.GetPostsByUser(userID)
	if err != nil {
		log.Errorf("Failed to get posts by user: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}
	postResponses := make([]*models.PostResponse, len(posts))
	for i, post := range posts {
		imageURL, err := h.storageUsecase.GetUrl(post.ImageKey)
		if err != nil {
			log.Errorf("Failed to get image URL: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"error": err.Error(),
			})
		}
		userImageURL, err := h.storageUsecase.GetUrl(post.Edges.User.IconImageKey)
		if err != nil {
			log.Errorf("Failed to get user image URL: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"error": err.Error(),
			})
		}
		postResponses[i] = models.NewPostResponse(post, imageURL, userImageURL)
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"posts": postResponses,
	})
}

func (h *PostHandler) CreatePost(c echo.Context) error {
	var req struct {
		Caption     string  `json:"caption,omitempty" form:"caption"`
		UserId      string  `json:"userId,omitempty" form:"userId"`
		DailyTaskId *string `json:"dailyTaskId,omitempty" form:"dailyTaskId"`
	}
	if err := c.Bind(&req); err != nil {
		log.Error("Failed to create post: invalid request body")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "Invalid request body",
		})
	}

	// Validate request
	if req.Caption == "" {
		log.Error("Failed to create post: caption is empty")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "情報が不足しています",
		})
	}

	file, err := c.FormFile("image")
	if err != nil {
		log.Errorf("Failed to create post: image file is required: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "画像ファイルが必要です",
		})
	}

	// Upload the image
	fileKey, err := h.storageUsecase.UploadImage(file, "posts")
	if err != nil {
		log.Errorf("Failed to create post: failed to upload image: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "画像のアップロードに失敗しました",
		})
	}

	post, err := h.postUsecase.CreatePost(req.Caption, req.UserId, fileKey, req.DailyTaskId)
	if err != nil {
		log.Errorf("Failed to create post: failed to create post: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "投稿の作成に失敗しました",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "投稿が作成されました",
		"post":    post,
	})
}
