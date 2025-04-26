package usecase

import (
	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
	"github.com/google/uuid"
)

type DailyTaskUsecase struct {
	dailyTaskRepository repository.DailyTaskRepository
	userRepository      repository.UserRepository
}

func NewDailyTaskUsecase(dailyTaskRepository repository.DailyTaskRepository, userRepository repository.UserRepository) *DailyTaskUsecase {
	return &DailyTaskUsecase{
		dailyTaskRepository: dailyTaskRepository,
		userRepository:      userRepository,
	}
}

func (u *DailyTaskUsecase) Create(userId uuid.UUID) error {
	return u.dailyTaskRepository.Create(userId)
}

func (u *DailyTaskUsecase) UpdateStreak(userId string) error {
	userUUID, err := uuid.Parse(userId)
	if err != nil {
		return err
	}

	prevTask, err := u.dailyTaskRepository.GetPreviousDailyTask(userUUID)
	if err != nil {
		return err
	}

	newStreak, err := u.GetNextStreakCount(prevTask)
	if err != nil {
		return err
	}

	err = u.userRepository.UpdateStreak(userUUID, newStreak)
	if err != nil {
		return err
	}

	return nil
}

// 次のstreakCountを計算する
func (u *DailyTaskUsecase) GetNextStreakCount(prevTask *models.DailyTaskWithEdges) (int, error) {
	if prevTask == nil {
		// ユーザーにとって最初のタスク
		return 1, nil
	}

	if prevTask.Post == nil {
		// 前回のタスクで投稿してないのでリセット
		return 1, nil
	}

	// 前回のタスクで投稿しているので、streakCountを1増やす
	return prevTask.User.StreakCount + 1, nil
}
