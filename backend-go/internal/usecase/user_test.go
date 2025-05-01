package usecase

import (
	"errors"
	"testing"

	"github.com/aki-13627/animalia/backend-go/internal/domain/repository/mock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestUserUsecase_Delete(t *testing.T) {
	testCases := []struct {
		name          string
		id            string
		mockError     error
		expectedError error
	}{
		{
			name:          "Success",
			id:            uuid.New().String(),
			mockError:     nil,
			expectedError: nil,
		},
		{
			name:          "Error",
			id:            uuid.New().String(),
			mockError:     errors.New("database error"),
			expectedError: errors.New("database error"),
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockUserRepo := &mock.MockUserRepository{
				DeleteFunc: func(id uuid.UUID) error {
					return tc.mockError
				},
			}
			mockStorageRepo := &mock.MockStorageRepository{}
			mockPostRepo := &mock.MockPostRepository{}
			mockPetRepo := &mock.MockPetRepository{}

			usecase := NewUserUsecase(mockUserRepo, mockStorageRepo, mockPostRepo, mockPetRepo, nil, nil)
			err := usecase.Delete(tc.id)
			if tc.expectedError != nil {
				assert.Equal(t, tc.expectedError, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
