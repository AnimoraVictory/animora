package services

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

var s3Client *s3.Client

// InitS3 initializes the S3 client
func InitS3() {
	// Configure AWS SDK
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(os.Getenv("AWS_REGION")),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			os.Getenv("AWS_ACCESS_KEY_ID"),
			os.Getenv("AWS_SECRET_ACCESS_KEY"),
			"",
		)),
	)
	if err != nil {
		log.Fatalf("Failed to load AWS config: %v", err)
	}

	// Create S3 client
	s3Client = s3.NewFromConfig(cfg)
}

// UploadToS3 uploads a file to S3 and returns the URL of the uploaded file
func UploadToS3(file *multipart.FileHeader, keyName string) (string, error) {
	// Open the file
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	// Read the file content
	buffer := make([]byte, file.Size)
	if _, err := src.Read(buffer); err != nil && err != io.EOF {
		return "", fmt.Errorf("failed to read file: %w", err)
	}

	// Generate a unique file key
	fileKey := fmt.Sprintf("%s/%s-%s", keyName, uuid.New().String(), filepath.Base(file.Filename))

	// Upload the file to S3
	_, err = s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(os.Getenv("AWS_S3_BUCKET_NAME")),
		Key:         aws.String(fileKey),
		Body:        bytes.NewReader(buffer),
		ContentType: aws.String(file.Header.Get("Content-Type")),
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload file to S3: %w", err)
	}

	// Return the URL of the uploaded file
	return fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s",
		os.Getenv("AWS_S3_BUCKET_NAME"),
		os.Getenv("AWS_REGION"),
		fileKey,
	), nil
}
