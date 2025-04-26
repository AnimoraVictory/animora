package usecase

import (
	"testing"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository/mock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestDailyTaskUsecase_GetNextStreakCount(t *testing.T) {
	testCases := []struct {
		name           string
		prevTask       *models.DailyTaskWithEdges
		expectedResult int
		expectedError  error
	}{
		{
			name:           "[成功]今回が初めてのタスクの場合",
			prevTask:       nil,
			expectedResult: 1,
			expectedError:  nil,
		},
		{
			name: "[成功]ストリークを更新する場合",
			prevTask: &models.DailyTaskWithEdges{
				DailyTask: &ent.DailyTask{
					ID:    uuid.New(),
					Edges: ent.DailyTaskEdges{},
				},
				User: ent.User{
					ID:          uuid.New(),
					StreakCount: 2,
				},
				Post: &ent.Post{
					ID: uuid.New(),
				},
			},
			expectedResult: 3,
			expectedError:  nil,
		},
		{
			name: "[成功]ストリークが途切れた場合",
			prevTask: &models.DailyTaskWithEdges{
				DailyTask: &ent.DailyTask{
					ID: uuid.New(),
				},
				User: ent.User{
					ID:          uuid.New(),
					StreakCount: 3,
				},
			},
			expectedResult: 1,
			expectedError:  nil,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockDailyTaskRepo := &mock.MockDailyTaskRepository{
				CreateFunc: func(userId uuid.UUID) error {
					return nil
				},
				GetPreviousDailyTaskFunc: func(userId uuid.UUID) (*models.DailyTaskWithEdges, error) {
					return tc.prevTask, nil
				},
			}

			mockUserRepo := &mock.MockUserRepository{
				GetByIdFunc: func(userId uuid.UUID) (*ent.User, error) {
					return &ent.User{
						ID:          userId,
						StreakCount: 1,
					}, nil
				},
			}
			usecase := NewDailyTaskUsecase(mockDailyTaskRepo, mockUserRepo)

			// GetNextStreakCount
			result, err := usecase.GetNextStreakCount(tc.prevTask)
			assert.Equal(t, tc.expectedResult, result)
			assert.Equal(t, tc.expectedError, err)
		})
	}
}
