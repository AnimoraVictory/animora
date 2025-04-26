package handler

import "github.com/aki-13627/animalia/backend-go/internal/usecase"

type LambdaHandler struct {
	dailyTaskUsecase usecase.DailyTaskUsecase
}

func NewLambdaHandler(dailyTaskUsecase usecase.DailyTaskUsecase) *LambdaHandler {
	return &LambdaHandler{
		dailyTaskUsecase: dailyTaskUsecase,
	}
}

// 本日DailyTaskを行わなかったユーザーのstreakCountをリセットする
func (h *LambdaHandler) UpdateStreakCounts() error {
	return h.dailyTaskUsecase.UpdateStreakCounts()
}

// 全てのユーザーに新しいDailyTaskを割り当てる
func (h *LambdaHandler) CreateDailyTasks() error {
	return h.dailyTaskUsecase.CreateDailyTasksForAllUsers()
}
