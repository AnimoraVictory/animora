package repository

import (
	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/google/uuid"
)

type CommentRepository interface {
	Create(userId uuid.UUID, postId uuid.UUID, content string) (*ent.Comment, error)
	Delete(commentId string) error
}
