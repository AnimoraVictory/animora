package mock

import (
	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
	"github.com/google/uuid"
)

// MockPostRepository is a mock implementation of the PostRepository interface
type MockPostRepository struct {
	GetAllPostsFunc     func() ([]*ent.Post, error)
	GetFollowsPostsFunc func(userID uuid.UUID, cursor *uuid.UUID, limit int) ([]*ent.Post, error)
	GetPostsByUserFunc  func(userId uuid.UUID) ([]*ent.Post, error)
	GetLikedPostsFunc   func(userId uuid.UUID) ([]*ent.Post, error)
	CreatePostFunc      func(caption string, userId string, fileKey string, dailyTaskId *string) (*ent.Post, error)
	UpdatePostFunc      func(postId, caption string) error
	DeletePostFunc      func(postId string) error
	GetByIdFunc         func(postId uuid.UUID) (*ent.Post, error)
	GetByIdsFunc        func(postIds []uuid.UUID, userID uuid.UUID) ([]*ent.Post, error)
}

// Ensure MockPostRepository implements the PostRepository interface
var _ repository.PostRepository = (*MockPostRepository)(nil)

func (m *MockPostRepository) GetAllPosts() ([]*ent.Post, error) {
	return m.GetAllPostsFunc()
}

func (m *MockPostRepository) GetFollowsPosts(userId uuid.UUID, cursor *uuid.UUID, limit int) ([]*ent.Post, error) {
	return m.GetFollowsPostsFunc(userId, cursor, limit)
}

func (m *MockPostRepository) GetPostsByUser(userId uuid.UUID) ([]*ent.Post, error) {
	return m.GetPostsByUserFunc(userId)
}

func (m *MockPostRepository) GetLikedPosts(userId uuid.UUID) ([]*ent.Post, error) {
	if m.GetLikedPostsFunc != nil {
		return m.GetLikedPostsFunc(userId)
	}
	return nil, nil
}

func (m *MockPostRepository) CreatePost(caption string, userId string, fileKey string, dailyTaskId *string) (*ent.Post, error) {
	return m.CreatePostFunc(caption, userId, fileKey, dailyTaskId)
}

func (m *MockPostRepository) UpdatePost(postId, caption string) error {
	return m.UpdatePostFunc(postId, caption)
}

func (m *MockPostRepository) DeletePost(postId string) error {
	return m.DeletePostFunc(postId)
}

func (m *MockPostRepository) GetById(postId uuid.UUID) (*ent.Post, error) {
	return m.GetByIdFunc(postId)
}

func (m *MockPostRepository) GetByIds(postIds []uuid.UUID, userID uuid.UUID) ([]*ent.Post, error) {
	return m.GetByIdsFunc(postIds, userID)
}
