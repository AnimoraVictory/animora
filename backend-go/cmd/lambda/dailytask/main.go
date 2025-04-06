package main

import (
	"context"
	"errors"
	"log"
	"math/rand"
	"os"
	"time"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/ent/enum"
	"github.com/aws/aws-lambda-go/lambda"
	_ "github.com/lib/pq" // PostgreSQLドライバー
	"github.com/samber/lo"
)

func Handler(ctx context.Context) error {
	// Get database URL from environment variable
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
		return errors.New("DATABASE_URL environment variable is not set")
	}

	client, err := ent.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
		return err
	}
	defer client.Close()

	users, err := client.User.Query().All(ctx)
	if err != nil {
		log.Fatalf("failed querying users: %v", err)
		return err
	}
	tasks := lo.Map(users, func(u *ent.User, _ int) *ent.DailyTaskCreate {
		return client.DailyTask.Create().
			SetCreatedAt(time.Now().Truncate(24 * time.Hour)).
			SetType(getRandomTaskType()).
			SetUserID(u.ID)
	})
	client.DailyTask.CreateBulk(tasks...).SaveX(ctx)

	// Log the number of tasks created
	log.Printf("Created %d daily tasks", len(tasks))
	return nil
}

func getRandomTaskType() enum.TaskType {
	taskTypes := []enum.TaskType{
		enum.TypeEating,
		enum.TypeSleeping,
		enum.TypePlaying,
	}
	return taskTypes[rand.Intn(len(taskTypes))]
}

func main() {
	lambda.Start(Handler)
}
