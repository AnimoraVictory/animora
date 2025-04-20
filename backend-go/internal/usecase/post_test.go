package usecase

import (
	"errors"
	"testing"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository/mock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestPostUsecase_GetAllPosts(t *testing.T) {
	// Test cases
	testCases := []struct {
		name          string
		mockPosts     []*ent.Post
		mockError     error
		expectedPosts []*ent.Post
		expectedError error
	}{
		{
			name:          "Success",
			mockPosts:     []*ent.Post{{ID: uuid.New(), Caption: "Test post"}},
			mockError:     nil,
			expectedPosts: []*ent.Post{{ID: uuid.New(), Caption: "Test post"}},
			expectedError: nil,
		},
		{
			name:          "Error",
			mockPosts:     nil,
			mockError:     errors.New("database error"),
			expectedPosts: nil,
			expectedError: errors.New("database error"),
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create mock repository
			mockRepo := &mock.MockPostRepository{
				GetAllPostsFunc: func() ([]*ent.Post, error) {
					return tc.mockPosts, tc.mockError
				},
			}

			// Create usecase with mock repository
			usecase := NewPostUsecase(mockRepo)

			// Call the method
			posts, err := usecase.GetAllPosts()

			// Check error
			if tc.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tc.expectedError.Error(), err.Error())
			} else {
				assert.NoError(t, err)
			}

			// Check result
			assert.Equal(t, len(tc.expectedPosts), len(posts))
			if len(tc.expectedPosts) > 0 {
				assert.Equal(t, tc.expectedPosts[0].Caption, posts[0].Caption)
			}
		})
	}
}

func TestPostUsecase_CreatePost(t *testing.T) {
	// Test cases
	testCases := []struct {
		name           string
		caption        string
		userId         string
		fileKey        string
		dailyTaskId    *string
		mockPost       *ent.Post
		mockError      error
		expectedPost   *ent.Post
		expectedError  error
	}{
		{
			name:          "Success",
			caption:       "Test caption",
			userId:        uuid.New().String(),
			fileKey:       "test-file-key",
			dailyTaskId:   nil,
			mockPost:      &ent.Post{ID: uuid.New(), Caption: "Test caption"},
			mockError:     nil,
			expectedPost:  &ent.Post{ID: uuid.New(), Caption: "Test caption"},
			expectedError: nil,
		},
		{
			name:          "Success with dailyTaskId",
			caption:       "Test caption",
			userId:        uuid.New().String(),
			fileKey:       "test-file-key",
			dailyTaskId:   func() *string { s := "task-id"; return &s }(),
			mockPost:      &ent.Post{ID: uuid.New(), Caption: "Test caption"},
			mockError:     nil,
			expectedPost:  &ent.Post{ID: uuid.New(), Caption: "Test caption"},
			expectedError: nil,
		},
		{
			name:          "Error",
			caption:       "Test caption",
			userId:        uuid.New().String(),
			fileKey:       "test-file-key",
			dailyTaskId:   nil,
			mockPost:      nil,
			mockError:     errors.New("database error"),
			expectedPost:  nil,
			expectedError: errors.New("database error"),
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create mock repository
			mockRepo := &mock.MockPostRepository{
				CreatePostFunc: func(caption, userId, fileKey string, dailyTaskId *string) (*ent.Post, error) {
					// Verify input parameters
					assert.Equal(t, tc.caption, caption)
					assert.Equal(t, tc.userId, userId)
					assert.Equal(t, tc.fileKey, fileKey)
					assert.Equal(t, tc.dailyTaskId, dailyTaskId)
					return tc.mockPost, tc.mockError
				},
			}

			// Create usecase with mock repository
			usecase := NewPostUsecase(mockRepo)

			// Call the method
			post, err := usecase.CreatePost(tc.caption, tc.userId, tc.fileKey, tc.dailyTaskId)

			// Check error
			if tc.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tc.expectedError.Error(), err.Error())
			} else {
				assert.NoError(t, err)
			}

			// Check result
			if tc.expectedPost != nil {
				assert.NotNil(t, post)
				assert.Equal(t, tc.expectedPost.Caption, post.Caption)
			} else {
				assert.Nil(t, post)
			}
		})
	}
}

func TestPostUsecase_UpdatePost(t *testing.T) {
	// Test cases
	testCases := []struct {
		name          string
		postId        string
		caption       string
		mockError     error
		expectedError error
	}{
		{
			name:          "Success",
			postId:        uuid.New().String(),
			caption:       "Updated caption",
			mockError:     nil,
			expectedError: nil,
		},
		{
			name:          "Error",
			postId:        uuid.New().String(),
			caption:       "Updated caption",
			mockError:     errors.New("database error"),
			expectedError: errors.New("database error"),
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create mock repository
			mockRepo := &mock.MockPostRepository{
				UpdatePostFunc: func(postId, caption string) error {
					// Verify input parameters
					assert.Equal(t, tc.postId, postId)
					assert.Equal(t, tc.caption, caption)
					return tc.mockError
				},
			}

			// Create usecase with mock repository
			usecase := NewPostUsecase(mockRepo)

			// Call the method
			err := usecase.UpdatePost(tc.postId, tc.caption)

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

func TestPostUsecase_DeletePost(t *testing.T) {
	// Test cases
	testCases := []struct {
		name          string
		postId        string
		mockError     error
		expectedError error
	}{
		{
			name:          "Success",
			postId:        uuid.New().String(),
			mockError:     nil,
			expectedError: nil,
		},
		{
			name:          "Error",
			postId:        uuid.New().String(),
			mockError:     errors.New("database error"),
			expectedError: errors.New("database error"),
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create mock repository
			mockRepo := &mock.MockPostRepository{
				DeletePostFunc: func(postId string) error {
					// Verify input parameters
					assert.Equal(t, tc.postId, postId)
					return tc.mockError
				},
			}

			// Create usecase with mock repository
			usecase := NewPostUsecase(mockRepo)

			// Call the method
			err := usecase.DeletePost(tc.postId)

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
