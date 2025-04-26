package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aws/aws-lambda-go/lambda"
	_ "github.com/lib/pq"
)

type ExpoPushMessage struct {
	To    string `json:"to"`
	Title string `json:"title"`
	Body  string `json:"body"`
	Sound string `json:"sound,omitempty"`
}

func Handler(ctx context.Context) error {
	client, err := ent.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		return fmt.Errorf("failed opening connection to postgres: %w", err)
	}
	defer client.Close()

	// device_tokens テーブルから全件取得
	deviceTokens, err := client.DeviceToken.Query().All(ctx)
	if err != nil {
		return fmt.Errorf("failed querying device tokens: %w", err)
	}

	if len(deviceTokens) == 0 {
		fmt.Println("no device tokens found")
		return nil // エラーじゃない
	}

	// 送信するメッセージ一覧を作る
	var messages []ExpoPushMessage
	for _, dt := range deviceTokens {
		messages = append(messages, ExpoPushMessage{
			To:    dt.Token,
			Title: "デイリータスクをやろう！",
			Body:  "今日のデイリータスクを忘れずにチェックしよう🐾",
			Sound: "default",
		})
	}

	// Expo Push通知API
	url := "https://exp.host/--/api/v2/push/send"

	payload, err := json.Marshal(messages)
	if err != nil {
		return fmt.Errorf("failed to marshal messages: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	if err != nil {
		return fmt.Errorf("failed creating request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	clientHttp := &http.Client{}
	resp, err := clientHttp.Do(req)
	if err != nil {
		return fmt.Errorf("failed sending push notifications: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, _ := ioutil.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		fmt.Printf("push notification request failed: status %d\n", resp.StatusCode)
		fmt.Println(string(bodyBytes))
		return fmt.Errorf("push notification request failed: status %d", resp.StatusCode)
	}

	fmt.Println("Push notifications sent successfully.")
	fmt.Println(string(bodyBytes))
	return nil
}

func main() {
	lambda.Start(Handler)
}
