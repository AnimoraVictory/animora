package usecase

import (
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
	"github.com/google/uuid"
)

type DailyTaskUsecase struct {
	dailyTaskRepository repository.DailyTaskRepository
}

func NewDailyTaskUsecase(dailyTaskRepository repository.DailyTaskRepository) *DailyTaskUsecase {
	return &DailyTaskUsecase{
		dailyTaskRepository: dailyTaskRepository,
	}
}

func (u *DailyTaskUsecase) Create(userId uuid.UUID) error {
	return u.dailyTaskRepository.Create(userId)
}
