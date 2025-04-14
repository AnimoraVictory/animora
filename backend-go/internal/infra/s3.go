package infra

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"path/filepath"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

type S3Repository struct {
	s3Client   *s3.Client
	bucketName string
}

func NewS3Repository(bucketName string) *S3Repository {
	ctx := context.TODO()
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("ap-northeast-1"),
	)
	if err != nil {
		log.Fatalf("Failed to load AWS config: %v", err)
	}

	// デバッグ用のログ
	creds, err := cfg.Credentials.Retrieve(ctx)
	if err != nil {
		log.Printf("Failed to retrieve credentials: %v", err)
	} else {
		log.Printf("Using credentials from provider: %s", creds.Source)
	}

	s3Client := s3.NewFromConfig(cfg)

	return &S3Repository{
		s3Client:   s3Client,
		bucketName: bucketName,
	}
}

func (r *S3Repository) UploadImage(file *multipart.FileHeader, directory string) (string, error) {
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	// ファイルの内容を読み込む
	buffer := make([]byte, file.Size)
	totalRead := 0
	for totalRead < int(file.Size) {
		n, err := src.Read(buffer[totalRead:])
		if err != nil && err != io.EOF {
			return "", fmt.Errorf("failed to read file: %w", err)
		}
		if n == 0 {
			break
		}
		totalRead += n
	}

	if totalRead == 0 {
		return "", fmt.Errorf("file is empty")
	}

	// デバッグログ
	log.Printf("File read complete: read %d bytes of %d expected", totalRead, file.Size)

	fileKey := fmt.Sprintf("%s/%s-%s", directory, uuid.New().String(), filepath.Base(file.Filename))

	contentType := file.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	// Upload the file to S3
	_, err = r.s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(r.bucketName),
		Key:         aws.String(fileKey),
		Body:        bytes.NewReader(buffer[:totalRead]),
		ContentType: aws.String(contentType),
	})
	if err != nil {
		log.Printf("S3 upload error: %v", err)
		return "", fmt.Errorf("failed to upload file to S3: %w", err)
	}

	log.Printf("Successfully uploaded file %s with content type %s", fileKey, contentType)
	return fileKey, nil
}

func (r *S3Repository) GetUrl(fileKey string) (string, error) {
	presigner := s3.NewPresignClient(r.s3Client)
	presignedURL, err := presigner.PresignGetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(r.bucketName),
		Key:    aws.String(fileKey),
	}, s3.WithPresignExpires(time.Hour))
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	return presignedURL.URL, nil
}

func (r *S3Repository) DeleteImage(fileKey string) error {
	_, err := r.s3Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(r.bucketName),
		Key:    aws.String(fileKey),
	})
	if err != nil {
		return fmt.Errorf("画像の削除に失敗しました: %w", err)
	}

	return nil
}
