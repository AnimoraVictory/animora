package infra

import (
	"context"
	"math/rand"
	"time"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/ent/dailytask"
	"github.com/aki-13627/animalia/backend-go/ent/enum"
	"github.com/aki-13627/animalia/backend-go/ent/user"
	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
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

func (r *DailyTaskRepository) GetLastDailyTask(userId uuid.UUID) (*models.DailyTaskWithEdges, error) {
	lastTask, err := r.db.DailyTask.Query().
		Where(dailytask.HasUserWith(user.ID(userId))).
		Order(ent.Desc(dailytask.FieldCreatedAt)).
		Limit(1).
		WithPost().
		WithUser().
		Only(context.Background())
	if ent.IsNotFound(err) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return models.NewDailyTaskWithEdges(lastTask)
}

// 前回のタスクを取得する。
// 前日にアサインされたタスクを取得する。
func (r *DailyTaskRepository) GetPreviousDailyTask(userId uuid.UUID) (*models.DailyTaskWithEdges, error) {
	lastTask, err := r.db.DailyTask.Query().
		Where(dailytask.HasUserWith(user.ID(userId))).
		Order(ent.Desc(dailytask.FieldCreatedAt)).
		Offset(1).
		Limit(1).
		WithPost().
		WithUser().
		Only(context.Background())
	if ent.IsNotFound(err) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return models.NewDailyTaskWithEdges(lastTask)
}
