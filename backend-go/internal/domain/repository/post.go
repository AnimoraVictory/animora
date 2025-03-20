package repository

import "github.com/htanos/animalia/backend-go/internal/domain/models"

type PostRepository interface {
	GetAllPosts() ([]*models.Post, error)
	GetPostsByUser(userId string) ([]*models.Post, error)
	CreatePost(caption, userId, fileKey string) (*models.Post, error)
	UpdatePost(postId, caption string) error
	DeletePost(postId string) error
}
