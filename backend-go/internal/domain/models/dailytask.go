package models

import (
	"fmt"
	"time"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/ent/enum"
	"github.com/google/uuid"
)

type DailyTaskBaseResponse struct {
	ID        uuid.UUID     `json:"id"`
	CreatedAt time.Time     `json:"createdAt"`
	Type      enum.TaskType `json:"type"`
}

type DailyTaskResponse struct {
	ID        uuid.UUID         `json:"id"`
	CreatedAt time.Time         `json:"createdAt"`
	Type      enum.TaskType     `json:"type"`
	Post      *PostBaseResponse `json:"post"`
}

type DailyTaskWithEdges struct {
	*ent.DailyTask
	Post *ent.Post
	User ent.User
}

func NewDailyTaskBaseResponse(dailyTask *ent.DailyTask) DailyTaskBaseResponse {
	return DailyTaskBaseResponse{
		ID:        dailyTask.ID,
		CreatedAt: dailyTask.CreatedAt,
		Type:      dailyTask.Type,
	}
}

func NewDailyTaskResponse(dailyTask *ent.DailyTask) DailyTaskResponse {
	var postResp *PostBaseResponse
	if dailyTask.Edges.Post != nil {
		resp := NewPostBaseResponse(dailyTask.Edges.Post)
		postResp = &resp
	}
	return DailyTaskResponse{
		ID:        dailyTask.ID,
		CreatedAt: dailyTask.CreatedAt,
		Type:      dailyTask.Type,
		Post:      postResp,
	}
}

func NewDailyTaskWithEdges(task *ent.DailyTask) (*DailyTaskWithEdges, error) {
	if task == nil {
		return nil, nil
	}
	// required field
	if task.Edges.User == nil {
		return nil, fmt.Errorf("user cannot be nil")
	}
	return &DailyTaskWithEdges{
		DailyTask: task,
		User:      *task.Edges.User,
		Post:      task.Edges.Post,
	}, nil
}
