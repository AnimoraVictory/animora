package mock

import (
	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
	"github.com/google/uuid"
)

// MockPostRepository is a mock implementation of the PostRepository interface
type MockPostRepository struct {
	GetAllPostsFunc      func() ([]*ent.Post, error)
	GetPostsByUserFunc   func(userId uuid.UUID) ([]*ent.Post, error)
	CreatePostFunc       func(caption, userId, fileKey string, dailyTaskId *string) (*ent.Post, error)
	UpdatePostFunc       func(postId, caption string) error
	DeletePostFunc       func(postId string) error
}

// Ensure MockPostRepository implements PostRepository interface
var _ repository.PostRepository = (*MockPostRepository)(nil)

// GetAllPosts calls the mocked GetAllPostsFunc
func (m *MockPostRepository) GetAllPosts() ([]*ent.Post, error) {
	return m.GetAllPostsFunc()
}

// GetPostsByUser calls the mocked GetPostsByUserFunc
func (m *MockPostRepository) GetPostsByUser(userId uuid.UUID) ([]*ent.Post, error) {
	return m.GetPostsByUserFunc(userId)
}

// CreatePost calls the mocked CreatePostFunc
func (m *MockPostRepository) CreatePost(caption, userId, fileKey string, dailyTaskId *string) (*ent.Post, error) {
	return m.CreatePostFunc(caption, userId, fileKey, dailyTaskId)
}

// UpdatePost calls the mocked UpdatePostFunc
func (m *MockPostRepository) UpdatePost(postId, caption string) error {
	return m.UpdatePostFunc(postId, caption)
}

// DeletePost calls the mocked DeletePostFunc
func (m *MockPostRepository) DeletePost(postId string) error {
	return m.DeletePostFunc(postId)
}
