package fastapi

import (
	"time"

	"github.com/aki-13627/animalia/backend-go/ent/enum"
	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/google/uuid"
)

type FastAPIDailyTask struct {
	ID        string        `json:"id"`
	CreatedAt string        `json:"created_at"`
	Type      enum.TaskType `json:"type"`
}

func NewDailyTaskResponseFromFastAPI(task *FastAPIDailyTask) models.DailyTaskBaseResponse {
	createdAt, _ := time.Parse(time.RFC3339, task.CreatedAt)
	return models.DailyTaskBaseResponse{
		ID:        uuid.MustParse(task.ID),
		CreatedAt: createdAt,
		Type:      task.Type,
	}
}
