package main

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
)

type Event struct{}

func handler(ctx context.Context, event Event) (string, error) {
	url := "https://animalia-lnzk.onrender.com/timeline"

	resp, err := http.Get(url)
	if err != nil {
		fmt.Fprintf(os.Stderr, "リクエストエラー: %v\n", err)
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		err := fmt.Errorf("ヘルスチェック失敗: status=%d", resp.StatusCode)
		fmt.Fprintln(os.Stderr, err)
		return "", err
	}

	fmt.Println("ヘルスチェック成功")
	return "ok", nil
}

func main() {
	lambda.Start(handler)
}
