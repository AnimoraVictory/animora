package mock

import (
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
)

// MockLikeRepository is a mock implementation of the LikeRepository interface
type MockLikeRepository struct {
	CreateFunc func(userId string, postId string) error
	DeleteFunc func(userId string, postId string) error
	CountFunc  func(postId string) (int, error)
}

// Ensure MockLikeRepository implements LikeRepository interface
var _ repository.LikeRepository = (*MockLikeRepository)(nil)

// Create calls the mocked CreateFunc
func (m *MockLikeRepository) Create(userId string, postId string) error {
	return m.CreateFunc(userId, postId)
}

// Delete calls the mocked DeleteFunc
func (m *MockLikeRepository) Delete(userId string, postId string) error {
	return m.DeleteFunc(userId, postId)
}

// Count calls the mocked CountFunc
func (m *MockLikeRepository) Count(postId string) (int, error) {
	return m.CountFunc(postId)
}
