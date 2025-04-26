package repository

import (
	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/google/uuid"
)

type DailyTaskRepository interface {
	Create(userId uuid.UUID) error
	GetPreviousDailyTask(userId uuid.UUID) (*models.DailyTaskWithEdges, error)
}
