package mock

import (
	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
)

// MockPetRepository is a mock implementation of the PetRepository interface
type MockPetRepository struct {
	GetByOwnerFunc func(ownerID string) ([]*ent.Pet, error)
	CreateFunc     func(name, petType, species, birthDay, fileKey, userID string) (*ent.Pet, error)
	UpdateFunc     func(petID, name, petType, species, birthDay string) error
	DeleteFunc     func(petID string) error
}

// Ensure MockPetRepository implements PetRepository interface
var _ repository.PetRepository = (*MockPetRepository)(nil)

// GetByOwner calls the mocked GetByOwnerFunc
func (m *MockPetRepository) GetByOwner(ownerID string) ([]*ent.Pet, error) {
	return m.GetByOwnerFunc(ownerID)
}

// Create calls the mocked CreateFunc
func (m *MockPetRepository) Create(name, petType, species, birthDay, fileKey, userID string) (*ent.Pet, error) {
	return m.CreateFunc(name, petType, species, birthDay, fileKey, userID)
}

// Update calls the mocked UpdateFunc
func (m *MockPetRepository) Update(petID, name, petType, species, birthDay string) error {
	return m.UpdateFunc(petID, name, petType, species, birthDay)
}

// Delete calls the mocked DeleteFunc
func (m *MockPetRepository) Delete(petID string) error {
	return m.DeleteFunc(petID)
}
