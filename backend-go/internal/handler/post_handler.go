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
	postResponses := make([]models.PostResponse, len(posts))
	for i, post := range posts {
		imageURL, err := h.storageUsecase.GetUrl(post.ImageKey)
		if err != nil {
			log.Errorf("Failed to get image URL: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"error": err.Error(),
			})
		}
		var userImageURL string
		if post.Edges.User.IconImageKey != "" {
			var err error
			userImageURL, err = h.storageUsecase.GetUrl(post.Edges.User.IconImageKey)
			if err != nil {
				log.Errorf("Failed to get user image URL: %v", err)
				return c.JSON(http.StatusInternalServerError, map[string]interface{}{
					"error": err.Error(),
				})
			}
		}

		commentResponses := make([]models.CommentResponse, len(post.Edges.Comments))
		for j, comment := range post.Edges.Comments {
			var commentUserImageURL string
			if comment.Edges.User.IconImageKey != "" {
				commentUserImageURL, err = h.storageUsecase.GetUrl(comment.Edges.User.IconImageKey)
				if err != nil {
					log.Errorf("Failed to get comment user image URL: %v", err)
					return c.JSON(http.StatusInternalServerError, map[string]interface{}{
						"error": err.Error(),
					})
				}
			}
			commentResponses[j] = models.NewCommentResponse(comment, comment.Edges.User, commentUserImageURL)
		}
		likeResponses := make([]models.LikeResponse, len(post.Edges.Likes))
		for j, like := range post.Edges.Likes {
			var likeUserImageURL string
			if like.Edges.User.IconImageKey != "" {
				likeUserImageURL, err = h.storageUsecase.GetUrl(like.Edges.User.IconImageKey)
				if err != nil {
					log.Errorf("Failed to get like user image URL: %v", err)
					return c.JSON(http.StatusInternalServerError, map[string]interface{}{
						"error": err.Error(),
					})
				}
			}
			likeResponses[j] = models.NewLikeResponse(like, likeUserImageURL)
		}
		postResponses[i] = models.NewPostResponse(post, imageURL, userImageURL, commentResponses, likeResponses)
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

	// ファイル情報のデバッグログ
	log.Printf("Received file: name=%s, size=%d, content-type=%s",
		file.Filename,
		file.Size,
		file.Header.Get("Content-Type"))

	// Content-Typeの検証
	contentType := file.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		log.Errorf("Invalid content type: %s", contentType)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "画像ファイルのみアップロード可能です",
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
