package repository

import "github.com/aki-13627/animalia/backend-go/ent"

type CommentRepository interface {
	Create(userId string, postId string, content string) (*ent.Comment, error)
	Delete(commentId string) error
}
