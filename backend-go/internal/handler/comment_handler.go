package handler

import (
	"net/http"

	"github.com/aki-13627/animalia/backend-go/internal/usecase"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/labstack/gommon/log"
)

type CommentHandler struct {
	commentUsecase usecase.CommentUsecase
	userUsecase    usecase.UserUsecase
}

func NewCommentHandler(commentUsecase usecase.CommentUsecase, userUsecase usecase.UserUsecase) *CommentHandler {
	return &CommentHandler{
		commentUsecase: commentUsecase,
		userUsecase:    userUsecase,
	}
}

func (h *CommentHandler) Create(c echo.Context) error {
	postId := c.FormValue("postId")
	content := c.FormValue("content")
	user, err := h.userUsecase.FindByEmail(c.Get("email").(string))
	if err != nil {
		log.Errorf("Failed to find current user: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "Failed to find current user",
		})
	}
	parsedPostId, err := uuid.Parse(postId)
	if err != nil {
		log.Errorf("Failed to parse postId: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "Failed to parse postId",
		})
	}
	comment, err := h.commentUsecase.Create(user.ID, parsedPostId, content)
	if err != nil {
		log.Errorf("Failed to create comment: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "Failed to create comment",
		})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Comment created successfully",
		"comment": comment,
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
