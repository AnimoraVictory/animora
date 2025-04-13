package repository

import "github.com/google/uuid"

type DailyTaskRepository interface {
	Create(userId uuid.UUID) error
}
