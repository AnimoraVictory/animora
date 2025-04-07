package handler

import (
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
	userId := c.FormValue("userId")
	postId := c.FormValue("postId")
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
