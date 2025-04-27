package mock

import (
	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
	"github.com/google/uuid"
)

type MockDailyTaskRepository struct {
	CreateFunc               func(userId uuid.UUID) error
	GetPreviousDailyTaskFunc func(userId uuid.UUID) (*models.DailyTaskWithEdges, error)
	GetLastDailyTaskFunc     func(userId uuid.UUID) (*models.DailyTaskWithEdges, error)
}

// Ensure MockDailyTaskRepository implements DailyTaskRepository interface
var _ repository.DailyTaskRepository = (*MockDailyTaskRepository)(nil)

func (m *MockDailyTaskRepository) Create(userId uuid.UUID) error {
	return m.CreateFunc(userId)
}

func (m *MockDailyTaskRepository) GetPreviousDailyTask(userId uuid.UUID) (*models.DailyTaskWithEdges, error) {
	return m.GetPreviousDailyTaskFunc(userId)
}

func (m *MockDailyTaskRepository) GetLastDailyTask(userId uuid.UUID) (*models.DailyTaskWithEdges, error) {
	return m.GetLastDailyTaskFunc(userId)
}
