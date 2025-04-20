package fastapi

import (
	"time"

	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/google/uuid"
)

type FastAPIComment struct {
	ID        uuid.UUID       `json:"id"`
	Content   string          `json:"content"`
	CreatedAt time.Time       `json:"created_at"`
	User      FastAPIUserBase `json:"user"`
}

func NewCommentResponseFromFastAPI(comment FastAPIComment, userIconURL string) models.CommentResponse {
	user := comment.User
	return models.CommentResponse{
		ID:        comment.ID,
		Content:   comment.Content,
		CreatedAt: comment.CreatedAt,
		User:      NewUserBaseResponseFromFastAPI(user, userIconURL),
	}
}
