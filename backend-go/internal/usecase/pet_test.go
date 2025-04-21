package usecase

import (
	"errors"
	"testing"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository/mock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestPetUsecase_GetByOwner(t *testing.T) {
	// Test cases
	testCases := []struct {
		name          string
		ownerID       string
		mockPets      []*ent.Pet
		mockError     error
		expectedPets  []*ent.Pet
		expectedError error
	}{
		{
			name:    "Success",
			ownerID: uuid.New().String(),
			mockPets: []*ent.Pet{
				{
					ID:       uuid.New(),
					Name:     "Fluffy",
					Type:     "Dog",
					Species:  "Golden Retriever",
					BirthDay: "2020-01-01",
				},
				{
					ID:       uuid.New(),
					Name:     "Whiskers",
					Type:     "Cat",
					Species:  "Siamese",
					BirthDay: "2021-01-01",
				},
			},
			mockError:     nil,
			expectedPets:  []*ent.Pet{}, // Will be compared by length only
			expectedError: nil,
		},
		{
			name:          "Error",
			ownerID:       uuid.New().String(),
			mockPets:      nil,
			mockError:     errors.New("database error"),
			expectedPets:  nil,
			expectedError: errors.New("database error"),
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create mock repository
			mockRepo := &mock.MockPetRepository{
				GetByOwnerFunc: func(ownerID string) ([]*ent.Pet, error) {
					// Verify input parameters
					assert.Equal(t, tc.ownerID, ownerID)
					return tc.mockPets, tc.mockError
				},
			}

			// Create usecase with mock repository
			usecase := NewPetUsecase(mockRepo)

			// Call the method
			pets, err := usecase.GetByOwner(tc.ownerID)

			// Check error
			if tc.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tc.expectedError.Error(), err.Error())
			} else {
				assert.NoError(t, err)
			}

			// Check result
			if tc.mockPets != nil {
				assert.Equal(t, len(tc.mockPets), len(pets))
				for i, pet := range pets {
					assert.Equal(t, tc.mockPets[i].Name, pet.Name)
					assert.Equal(t, tc.mockPets[i].Type, pet.Type)
					assert.Equal(t, tc.mockPets[i].Species, pet.Species)
				}
			} else {
				assert.Nil(t, pets)
			}
		})
	}
}

func TestPetUsecase_Create(t *testing.T) {
	// Test cases
	testCases := []struct {
		name          string
		petName       string
		petType       string
		species       string
		birthDay      string
		fileKey       string
		userID        string
		mockPet       *ent.Pet
		mockError     error
		expectedPet   *ent.Pet
		expectedError error
	}{
		{
			name:     "Success",
			petName:  "Fluffy",
			petType:  "Dog",
			species:  "Golden Retriever",
			birthDay: "2020-01-01",
			fileKey:  "pet-image-key",
			userID:   uuid.New().String(),
			mockPet: &ent.Pet{
				ID:       uuid.New(),
				Name:     "Fluffy",
				Type:     "Dog",
				Species:  "Golden Retriever",
				BirthDay: "2020-01-01",
			},
			mockError:     nil,
			expectedPet:   &ent.Pet{}, // Will be compared by name only
			expectedError: nil,
		},
		{
			name:          "Error",
			petName:       "Fluffy",
			petType:       "Dog",
			species:       "Golden Retriever",
			birthDay:      "2020-01-01",
			fileKey:       "pet-image-key",
			userID:        uuid.New().String(),
			mockPet:       nil,
			mockError:     errors.New("database error"),
			expectedPet:   nil,
			expectedError: errors.New("database error"),
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create mock repository
			mockRepo := &mock.MockPetRepository{
				CreateFunc: func(name, petType, species, birthDay, fileKey, userID string) (*ent.Pet, error) {
					// Verify input parameters
					assert.Equal(t, tc.petName, name)
					assert.Equal(t, tc.petType, petType)
					assert.Equal(t, tc.species, species)
					assert.Equal(t, tc.birthDay, birthDay)
					assert.Equal(t, tc.fileKey, fileKey)
					assert.Equal(t, tc.userID, userID)
					return tc.mockPet, tc.mockError
				},
			}

			// Create usecase with mock repository
			usecase := NewPetUsecase(mockRepo)

			// Call the method
			pet, err := usecase.Create(tc.petName, tc.petType, tc.species, tc.birthDay, tc.fileKey, tc.userID)

			// Check error
			if tc.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tc.expectedError.Error(), err.Error())
			} else {
				assert.NoError(t, err)
			}

			// Check result
			if tc.mockPet != nil {
				assert.NotNil(t, pet)
				assert.Equal(t, tc.mockPet.Name, pet.Name)
				assert.Equal(t, tc.mockPet.Type, pet.Type)
				assert.Equal(t, tc.mockPet.Species, pet.Species)
			} else {
				assert.Nil(t, pet)
			}
		})
	}
}

func TestPetUsecase_Update(t *testing.T) {
	// Test cases
	testCases := []struct {
		name          string
		petID         string
		petName       string
		petType       string
		species       string
		birthDay      string
		mockError     error
		expectedError error
	}{
		{
			name:          "Success",
			petID:         uuid.New().String(),
			petName:       "Fluffy",
			petType:       "Dog",
			species:       "Golden Retriever",
			birthDay:      "2020-01-01",
			mockError:     nil,
			expectedError: nil,
		},
		{
			name:          "Error",
			petID:         uuid.New().String(),
			petName:       "Fluffy",
			petType:       "Dog",
			species:       "Golden Retriever",
			birthDay:      "2020-01-01",
			mockError:     errors.New("database error"),
			expectedError: errors.New("database error"),
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create mock repository
			mockRepo := &mock.MockPetRepository{
				UpdateFunc: func(petID, name, petType, species, birthDay string) error {
					// Verify input parameters
					assert.Equal(t, tc.petID, petID)
					assert.Equal(t, tc.petName, name)
					assert.Equal(t, tc.petType, petType)
					assert.Equal(t, tc.species, species)
					assert.Equal(t, tc.birthDay, birthDay)
					return tc.mockError
				},
			}

			// Create usecase with mock repository
			usecase := NewPetUsecase(mockRepo)

			// Call the method
			err := usecase.Update(tc.petID, tc.petName, tc.petType, tc.species, tc.birthDay)

			// Check error
			if tc.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tc.expectedError.Error(), err.Error())
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestPetUsecase_Delete(t *testing.T) {
	// Test cases
	testCases := []struct {
		name          string
		petID         string
		mockError     error
		expectedError error
	}{
		{
			name:          "Success",
			petID:         uuid.New().String(),
			mockError:     nil,
			expectedError: nil,
		},
		{
			name:          "Error",
			petID:         uuid.New().String(),
			mockError:     errors.New("database error"),
			expectedError: errors.New("database error"),
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create mock repository
			mockRepo := &mock.MockPetRepository{
				DeleteFunc: func(petID string) error {
					// Verify input parameters
					assert.Equal(t, tc.petID, petID)
					return tc.mockError
				},
			}

			// Create usecase with mock repository
			usecase := NewPetUsecase(mockRepo)

			// Call the method
			err := usecase.Delete(tc.petID)

			// Check error
			if tc.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tc.expectedError.Error(), err.Error())
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
