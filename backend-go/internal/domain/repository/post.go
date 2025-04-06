package repository

import (
	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/google/uuid"
)

type PostRepository interface {
	GetAllPosts() ([]*ent.Post, error)
	GetPostsByUser(userId uuid.UUID) ([]*ent.Post, error)
	CreatePost(caption, userId, fileKey string, dailyTaskId *string) (*ent.Post, error)
	UpdatePost(postId, caption string) error
	DeletePost(postId string) error
}
