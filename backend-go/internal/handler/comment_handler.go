package handler

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/aki-13627/animalia/backend-go/internal/usecase"
	"github.com/labstack/echo/v4"
	"github.com/labstack/gommon/log"
)

type CommentHandler struct {
	commentUsecase usecase.CommentUsecase
}

func NewCommentHandler(commentUsecase usecase.CommentUsecase) *CommentHandler {
	return &CommentHandler{
		commentUsecase: commentUsecase,
	}
}
func (h *CommentHandler) Create(c echo.Context) error {
	userId := c.QueryParam("userId")
	postId := c.QueryParam("postId")
	content := c.FormValue("content")
	err := h.commentUsecase.Create(userId, postId, content)
	if err != nil {
		log.Errorf("Failed to create comment: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "Failed to create comment",
		})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Comment created successfully",
	})
}

func (h *CommentHandler) Delete(c echo.Context) error {
	commentId := c.QueryParam("commentId")
	err := h.commentUsecase.Delete(commentId)
	if err != nil {
		log.Errorf("Failed to delete comment: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "Failed to delete comment",
		})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Comment deleted successfully",
	})
}

func (h *CommentHandler) Count(c echo.Context) error {
	postId := c.QueryParam("postId")
	count, err := h.commentUsecase.Count(postId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// コメントが存在しないのは正常なので count = 0 で返す
			return c.JSON(http.StatusOK, map[string]interface{}{
				"count": 0,
			})
		}
		log.Errorf("Failed to count comments: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "Failed to count comments",
		})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"count": count,
	})
}

func (h *CommentHandler) GetByPostId(c echo.Context) error {
	postId := c.QueryParam("postId")
	comments, err := h.commentUsecase.GetByPostId(postId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return c.JSON(http.StatusOK, map[string]interface{}{
				"comments": []interface{}{},
			})
		}
		log.Errorf("Failed to get comments: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "Failed to get comments",
		})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"comments": comments,
	})
}
