package handler

import (
	"net/http"

	"github.com/aki-13627/animalia/backend-go/internal/usecase"
	"github.com/labstack/echo/v4"
	"github.com/labstack/gommon/log"
)

type LikeHandler struct {
	likeUsecase usecase.LikeUsecase
}

func NewLikeHandler(likeUsecase usecase.LikeUsecase) *LikeHandler {
	return &LikeHandler{
		likeUsecase: likeUsecase,
	}
}

func (h *LikeHandler) Create(c echo.Context) error {
	userId := c.Param("userId")
	postId := c.Param("postId")
	err := h.likeUsecase.Create(userId, postId)
	if err != nil {
		log.Errorf("Failed to create like: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "Failed to create like",
		})
	}
	return c.NoContent(http.StatusOK)
}

func (h *LikeHandler) Delete(c echo.Context) error {
	userId := c.Param("userId")
	postId := c.Param("postId")
	err := h.likeUsecase.Delete(userId, postId)
	if err != nil {
		log.Errorf("Failed to delete like: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "Failed to delete like",
		})
	}
	return c.NoContent(http.StatusOK)
}

func (h *LikeHandler) Count(c echo.Context) error {
	postId := c.Param("postId")
	count, err := h.likeUsecase.Count(postId)
	if err != nil {
		log.Errorf("Failed to count likes: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "Failed to count likes",
		})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"count": count,
	})
}
