package infra

import (
	"context"
	"math/rand"
	"time"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/ent/enum"
	"github.com/google/uuid"
)

type DailyTaskRepository struct {
	db *ent.Client
}

func NewDailyTaskRepository(db *ent.Client) *DailyTaskRepository {
	return &DailyTaskRepository{
		db: db,
	}
}

func (r *DailyTaskRepository) Create(userID uuid.UUID) error {
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	taskTypes := []enum.TaskType{
		enum.TypeEating,
		enum.TypeSleeping,
		enum.TypePlaying,
	}
	randomType := taskTypes[rng.Intn(len(taskTypes))]

	_, err := r.db.DailyTask.Create().
		SetUserID(userID).
		SetType(randomType).
		Save(context.Background())

	return err
}
