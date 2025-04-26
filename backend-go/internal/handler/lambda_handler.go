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

func (h *LambdaHandler) HandleEveryDay() error {
	err := h.dailyTaskUsecase.UpdateStreakCounts()
	if err != nil {
		return err
	}
	err = h.dailyTaskUsecase.CreateDailyTasksForAllUsers()
	if err != nil {
		return err
	}
	return nil
}
