package main

import (
	"context"
	"errors"
	"log"
	"os"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/internal/injector"
	"github.com/aws/aws-lambda-go/lambda"
	_ "github.com/lib/pq" // PostgreSQLドライバー
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
	}
	defer client.Close()
	// Auto migration
	if err := client.Schema.Create(context.Background()); err != nil {
		log.Fatalf("failed creating schema resources: %v", err)
	}

	lambdaHandler := injector.InjectLambdaHandler()
	lambdaHandler.UpdateStreakCounts()

	// streakCountを更新する
	lambdaHandler.UpdateStreakCounts()

	// 新しいタスクを割り当てる
	lambdaHandler.CreateDailyTasks()

	return nil
}

func main() {
	lambda.Start(Handler)
}
