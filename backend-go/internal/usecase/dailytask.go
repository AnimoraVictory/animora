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

func (u *DailyTaskUsecase) UpdateStreakCount(userId string) error {
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

	err = u.userRepository.UpdateStreakCount(userUUID, newStreak)
	if err != nil {
		return err
	}

	return nil
}

// 次のstreakCountを計算する
func (u *DailyTaskUsecase) GetNextStreakCount(prevTask *models.DailyTaskWithEdges) (uint32, error) {
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

// 全てのユーザーに新しいDailyTaskを割り当てる
func (u *DailyTaskUsecase) CreateDailyTasksForAllUsers() error {
	users, err := u.userRepository.GetAll()
	if err != nil {
		return err
	}

	for _, user := range users {
		err := u.dailyTaskRepository.Create(user.ID)
		if err != nil {
			return err
		}
	}
	return nil
}

// 本日のDailyTaskを行わなかったユーザーのstreakCountをリセットする
func (u *DailyTaskUsecase) UpdateStreakCounts() error {
	users, err := u.userRepository.GetAll()
	if err != nil {
		return err
	}

	for _, user := range users {
		lastTask, err := u.dailyTaskRepository.GetLastDailyTask(user.ID)
		if err != nil {
			return err
		}

		if lastTask == nil {
			// 前回のタスクがないので、スキップ
			continue
		}

		// 最後のタスクで投稿していなければ、streakCountをリセット
		if lastTask.Post == nil {
			u.userRepository.UpdateStreakCount(user.ID, 0)
		}
	}
	return nil
}
