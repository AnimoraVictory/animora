package usecase

import (
	"errors"
	"testing"

	"github.com/aki-13627/animalia/backend-go/internal/domain/repository/mock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestLikeUsecase_Create(t *testing.T) {
	// Test cases
	testCases := []struct {
		name          string
		userID        string
		postID        string
		mockError     error
		expectedError error
	}{
		{
			name:          "Success",
			userID:        uuid.New().String(),
			postID:        uuid.New().String(),
			mockError:     nil,
			expectedError: nil,
		},
		{
			name:          "Error",
			userID:        uuid.New().String(),
			postID:        uuid.New().String(),
			mockError:     errors.New("database error"),
			expectedError: errors.New("database error"),
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create mock repository
			mockRepo := &mock.MockLikeRepository{
				CreateFunc: func(userId, postId string) error {
					// Verify input parameters
					assert.Equal(t, tc.userID, userId)
					assert.Equal(t, tc.postID, postId)
					return tc.mockError
				},
			}

			// Create usecase with mock repository
			usecase := NewLikeUsecase(mockRepo)

			// Call the method
			err := usecase.Create(tc.userID, tc.postID)

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

func TestLikeUsecase_Delete(t *testing.T) {
	// Test cases
	testCases := []struct {
		name          string
		userID        string
		postID        string
		mockError     error
		expectedError error
	}{
		{
			name:          "Success",
			userID:        uuid.New().String(),
			postID:        uuid.New().String(),
			mockError:     nil,
			expectedError: nil,
		},
		{
			name:          "Error",
			userID:        uuid.New().String(),
			postID:        uuid.New().String(),
			mockError:     errors.New("database error"),
			expectedError: errors.New("database error"),
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create mock repository
			mockRepo := &mock.MockLikeRepository{
				DeleteFunc: func(userId, postId string) error {
					// Verify input parameters
					assert.Equal(t, tc.userID, userId)
					assert.Equal(t, tc.postID, postId)
					return tc.mockError
				},
			}

			// Create usecase with mock repository
			usecase := NewLikeUsecase(mockRepo)

			// Call the method
			err := usecase.Delete(tc.userID, tc.postID)

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

func TestLikeUsecase_Count(t *testing.T) {
	// Test cases
	testCases := []struct {
		name          string
		postID        string
		mockCount     int
		mockError     error
		expectedCount int
		expectedError error
	}{
		{
			name:          "Success",
			postID:        uuid.New().String(),
			mockCount:     10,
			mockError:     nil,
			expectedCount: 10,
			expectedError: nil,
		},
		{
			name:          "Error",
			postID:        uuid.New().String(),
			mockCount:     0,
			mockError:     errors.New("database error"),
			expectedCount: 0,
			expectedError: errors.New("database error"),
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create mock repository
			mockRepo := &mock.MockLikeRepository{
				CountFunc: func(postId string) (int, error) {
					// Verify input parameters
					assert.Equal(t, tc.postID, postId)
					return tc.mockCount, tc.mockError
				},
			}

			// Create usecase with mock repository
			usecase := NewLikeUsecase(mockRepo)

			// Call the method
			count, err := usecase.Count(tc.postID)

			// Check error
			if tc.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tc.expectedError.Error(), err.Error())
			} else {
				assert.NoError(t, err)
			}

			// Check result
			assert.Equal(t, tc.expectedCount, count)
		})
	}
}
