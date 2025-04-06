package repository

import (
	"github.com/aki-13627/animalia/backend-go/ent"
)

type CommentRepository interface {
	Create(userId string, postId string, content string) error
	Delete(commentId string) error
	Count(postId string) (int, error)
	GetByPostId(postId string) ([]*ent.Comment, error)
}
