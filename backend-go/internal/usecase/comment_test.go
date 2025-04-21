package usecase

import (
	"errors"
	"testing"
	"time"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository/mock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestCommentUsecase_Create(t *testing.T) {
	// Test cases
	testCases := []struct {
		name           string
		userID         string
		postID         string
		content        string
		mockComment    *ent.Comment
		mockUser       *ent.User
		mockIconURL    string
		mockError      error
		mockStorageErr error
		expectedResult *models.CommentResponse
		expectedError  bool
	}{
		{
			name:        "Success",
			userID:      uuid.New().String(),
			postID:      uuid.New().String(),
			content:     "Test comment",
			mockComment: createMockComment(uuid.New(), "Test comment", time.Now()),
			mockUser:    createMockUser(uuid.New(), "test@example.com", "Test User", "Bio", "icon-key"),
			mockIconURL: "https://example.com/icon.jpg",
			mockError:   nil,
			expectedResult: &models.CommentResponse{
				ID:        uuid.New(),
				Content:   "Test comment",
				CreatedAt: time.Now(),
				User: models.UserBaseResponse{
					ID:           uuid.New(),
					Email:        "test@example.com",
					Name:         "Test User",
					Bio:          "Bio",
					IconImageUrl: stringPtr("https://example.com/icon.jpg"),
				},
			},
			expectedError: false,
		},
		{
			name:           "Error creating comment",
			userID:         uuid.New().String(),
			postID:         uuid.New().String(),
			content:        "Test comment",
			mockComment:    nil,
			mockUser:       nil,
			mockIconURL:    "",
			mockError:      errors.New("database error"),
			expectedResult: nil,
			expectedError:  true,
		},
		{
			name:           "Error with nil user edge",
			userID:         uuid.New().String(),
			postID:         uuid.New().String(),
			content:        "Test comment",
			mockComment:    createMockCommentWithoutUser(uuid.New(), "Test comment", time.Now()),
			mockUser:       nil,
			mockIconURL:    "",
			mockError:      nil,
			expectedResult: nil,
			expectedError:  true,
		},
		{
			name:           "Error getting icon URL",
			userID:         uuid.New().String(),
			postID:         uuid.New().String(),
			content:        "Test comment",
			mockComment:    createMockComment(uuid.New(), "Test comment", time.Now()),
			mockUser:       createMockUser(uuid.New(), "test@example.com", "Test User", "Bio", "icon-key"),
			mockIconURL:    "",
			mockError:      nil,
			mockStorageErr: errors.New("storage error"),
			expectedResult: nil,
			expectedError:  true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// UUID を先に生成してから tc に代入
			userUUID := uuid.New()
			postUUID := uuid.New()
			tc.userID = userUUID.String()
			tc.postID = postUUID.String()

			mockCommentRepo := &mock.MockCommentRepository{
				CreateFunc: func(userId uuid.UUID, postId uuid.UUID, content string) (*ent.Comment, error) {
					expectedUserID, _ := uuid.Parse(tc.userID)
					expectedPostID, _ := uuid.Parse(tc.postID)

					assert.Equal(t, expectedUserID, userId)
					assert.Equal(t, expectedPostID, postId)
					assert.Equal(t, tc.content, content)

					return tc.mockComment, tc.mockError
				},
			}

			mockPostRepo := &mock.MockPostRepository{
				GetByIdFunc: func(postId uuid.UUID) (*ent.Post, error) {
					return &ent.Post{ID: postId}, nil
				},
			}

			mockStorageRepo := &mock.MockStorageRepository{
				GetUrlFunc: func(fileKey string) (string, error) {
					if tc.mockUser != nil {
						assert.Equal(t, tc.mockUser.IconImageKey, fileKey)
					}
					return tc.mockIconURL, tc.mockStorageErr
				},
			}

			usecase := NewCommentUsecase(mockCommentRepo, mockPostRepo, mockStorageRepo)

			result, err := usecase.Create(userUUID, postUUID, tc.content)

			if tc.expectedError {
				assert.Error(t, err)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, tc.mockComment.Content, result.Content)
				assert.Equal(t, tc.mockUser.Email, result.User.Email)
				assert.Equal(t, tc.mockUser.Name, result.User.Name)
				assert.Equal(t, tc.mockUser.Bio, result.User.Bio)
				assert.Equal(t, tc.mockIconURL, *result.User.IconImageUrl)
			}
		})
	}
}

func TestCommentUsecase_Delete(t *testing.T) {
	// Test cases
	testCases := []struct {
		name          string
		commentID     string
		mockError     error
		expectedError bool
	}{
		{
			name:          "Success",
			commentID:     uuid.New().String(),
			mockError:     nil,
			expectedError: false,
		},
		{
			name:          "Error",
			commentID:     uuid.New().String(),
			mockError:     errors.New("database error"),
			expectedError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create mock repository
			mockCommentRepo := &mock.MockCommentRepository{
				DeleteFunc: func(commentId string) error {
					// Verify input parameters
					assert.Equal(t, tc.commentID, commentId)
					return tc.mockError
				},
			}

			mockPostRepo := &mock.MockPostRepository{}

			mockStorageRepo := &mock.MockStorageRepository{}

			// Create usecase with mock repositories
			usecase := NewCommentUsecase(mockCommentRepo, mockPostRepo, mockStorageRepo)

			// Call the method
			err := usecase.Delete(tc.commentID)

			// Check error
			if tc.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// Helper functions to create mock objects

func createMockComment(id uuid.UUID, content string, createdAt time.Time) *ent.Comment {
	return &ent.Comment{
		ID:        id,
		Content:   content,
		CreatedAt: createdAt,
		Edges: ent.CommentEdges{
			User: createMockUser(uuid.New(), "test@example.com", "Test User", "Bio", "icon-key"),
		},
	}
}

func createMockCommentWithoutUser(id uuid.UUID, content string, createdAt time.Time) *ent.Comment {
	return &ent.Comment{
		ID:        id,
		Content:   content,
		CreatedAt: createdAt,
		Edges:     ent.CommentEdges{},
	}
}

func createMockUser(id uuid.UUID, email, name, bio, iconKey string) *ent.User {
	return &ent.User{
		ID:           id,
		Email:        email,
		Name:         name,
		Bio:          bio,
		IconImageKey: iconKey,
	}
}

func stringPtr(s string) *string {
	return &s
}
