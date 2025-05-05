package mock

import (
	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
	"github.com/google/uuid"
)

// MockUserRepository is a mock implementation of the UserRepository interface
type MockUserRepository struct {
	CreateFunc            func(name, email string) (*ent.User, error)
	ExistsEmailFunc       func(email string) (bool, error)
	FindByEmailFunc       func(email string) (*ent.User, error)
	GetAllFunc            func() ([]*ent.User, error)
	GetByIdFunc           func(id uuid.UUID) (*ent.User, error)
	UpdateFunc            func(id uuid.UUID, name string, description string, iconImageKey string) error
	UpdateStreakCountFunc func(id uuid.UUID, streak uint32) error
	DeleteFunc            func(id uuid.UUID) error
	FollowFunc            func(toId string, fromId string) error
	UnfollowFunc          func(toId string, fromId string) error
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

// GetAll calls the mocked GetAllFunc
func (m *MockUserRepository) GetAll() ([]*ent.User, error) {
	return m.GetAllFunc()
}

// GetById calls the mocked GetByIdFunc
func (m *MockUserRepository) GetById(id uuid.UUID) (*ent.User, error) {
	return m.GetByIdFunc(id)
}

// Update calls the mocked UpdateFunc
func (m *MockUserRepository) Update(id uuid.UUID, name string, description string, iconImageKey string) error {
	return m.UpdateFunc(id, name, description, iconImageKey)
}

// UpdateStreakCount calls the mocked UpdateStreakCountFunc
func (m *MockUserRepository) UpdateStreakCount(id uuid.UUID, streak uint32) error {
	return m.UpdateStreakCountFunc(id, streak)
}

// Delete calls the mocked DeleteFunc
func (m *MockUserRepository) Delete(id uuid.UUID) error {
	return m.DeleteFunc(id)
}

// Follow calls the mocked FollowFunc
func (m *MockUserRepository) Follow(toId string, fromId string) error {
	return m.FollowFunc(toId, fromId)
}

// Unfollow calls the mocked UnfollowFunc
func (m *MockUserRepository) Unfollow(toId string, fromId string) error {
	return m.UnfollowFunc(toId, fromId)
}
