package models

import (
	"time"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/google/uuid"
)

type CommentResponse struct {
	ID        uuid.UUID        `json:"id"`
	Content   string           `json:"content"`
	CreatedAt time.Time        `json:"createdAt"`
	User      UserBaseResponse `json:"user"`
}

func NewCommentResponse(comment *ent.Comment, user *ent.User, userImageURL string) CommentResponse {
	return CommentResponse{
		ID:        comment.ID,
		Content:   comment.Content,
		CreatedAt: comment.CreatedAt,
		User:      NewUserBaseResponse(user, userImageURL),
	}
}
