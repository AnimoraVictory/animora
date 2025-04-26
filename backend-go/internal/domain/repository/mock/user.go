package mock

import (
	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
	"github.com/google/uuid"
)

// MockUserRepository is a mock implementation of the UserRepository interface
type MockUserRepository struct {
	CreateFunc       func(name, email string) (*ent.User, error)
	ExistsEmailFunc  func(email string) (bool, error)
	FindByEmailFunc  func(email string) (*ent.User, error)
	GetByIdFunc      func(id uuid.UUID) (*ent.User, error)
	UpdateFunc       func(id uuid.UUID, name string, description string, iconImageKey string) error
	UpdateStreakFunc func(id uuid.UUID, streak int) error
	FollowFunc       func(toId string, fromId string) error
	UnfollowFunc     func(toId string, fromId string) error
}

// Ensure MockUserRepository implements UserRepository interface
var _ repository.UserRepository = (*MockUserRepository)(nil)

// Create calls the mocked CreateFunc
func (m *MockUserRepository) Create(name, email string) (*ent.User, error) {
	return m.CreateFunc(name, email)
}

// ExistsEmail calls the mocked ExistsEmailFunc
func (m *MockUserRepository) ExistsEmail(email string) (bool, error) {
	return m.ExistsEmailFunc(email)
}

// FindByEmail calls the mocked FindByEmailFunc
func (m *MockUserRepository) FindByEmail(email string) (*ent.User, error) {
	return m.FindByEmailFunc(email)
}

// GetById calls the mocked GetByIdFunc
func (m *MockUserRepository) GetById(id uuid.UUID) (*ent.User, error) {
	return m.GetByIdFunc(id)
}

// Update calls the mocked UpdateFunc
func (m *MockUserRepository) Update(id uuid.UUID, name string, description string, iconImageKey string) error {
	return m.UpdateFunc(id, name, description, iconImageKey)
}

// UpdateStreak calls the mocked UpdateStreakFunc
func (m *MockUserRepository) UpdateStreak(id uuid.UUID, streak int) error {
	return m.UpdateStreakFunc(id, streak)
}

// Follow calls the mocked FollowFunc
func (m *MockUserRepository) Follow(toId string, fromId string) error {
	return m.FollowFunc(toId, fromId)
}

// Unfollow calls the mocked UnfollowFunc
func (m *MockUserRepository) Unfollow(toId string, fromId string) error {
	return m.UnfollowFunc(toId, fromId)
}
