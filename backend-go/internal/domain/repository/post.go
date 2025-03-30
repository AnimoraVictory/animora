package repository

import "github.com/htanos/animalia/backend-go/ent"

type PostRepository interface {
	GetAllPosts() ([]*ent.Post, error)
	GetPostsByUser(userId string) ([]*ent.Post, error)
	CreatePost(caption, userId, fileKey string) (*ent.Post, error)
	UpdatePost(postId, caption string) error
	DeletePost(postId string) error
}
