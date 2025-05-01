package mock

import (
	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
)

type MockBlockRelationRepository struct {
	CreateFunc         func(fromID, toID string) error
	DeleteFunc         func(fromID, toID string) error
	BlockingUsersFunc  func(fromID string) ([]*ent.User, error)
	BlockedByUsersFunc func(toID string) ([]*ent.User, error)
}

var _ repository.BlockRelationRepository = (*MockBlockRelationRepository)(nil)

func (m *MockBlockRelationRepository) Create(fromID, toID string) error {
	return m.CreateFunc(fromID, toID)
}

func (m *MockBlockRelationRepository) Delete(fromID, toID string) error {
	return m.DeleteFunc(fromID, toID)
}

func (m *MockBlockRelationRepository) BlockingUsers(fromID string) ([]*ent.User, error) {
	return m.BlockingUsersFunc(fromID)
}

func (m *MockBlockRelationRepository) BlockedByUsers(toID string) ([]*ent.User, error) {
	return m.BlockedByUsersFunc(toID)
}
