package mock

import (
	"mime/multipart"

	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
)

// MockStorageRepository is a mock implementation of the StorageRepository interface
type MockStorageRepository struct {
	UploadImageFunc func(file *multipart.FileHeader, directory string) (string, error)
	GetUrlFunc      func(fileKey string) (string, error)
	DeleteImageFunc func(fileKey string) error
}

// Ensure MockStorageRepository implements StorageRepository interface
var _ repository.StorageRepository = (*MockStorageRepository)(nil)

// UploadImage calls the mocked UploadImageFunc
func (m *MockStorageRepository) UploadImage(file *multipart.FileHeader, directory string) (string, error) {
	return m.UploadImageFunc(file, directory)
}

// GetUrl calls the mocked GetUrlFunc
func (m *MockStorageRepository) GetUrl(fileKey string) (string, error) {
	return m.GetUrlFunc(fileKey)
}

// DeleteImage calls the mocked DeleteImageFunc
func (m *MockStorageRepository) DeleteImage(fileKey string) error {
	return m.DeleteImageFunc(fileKey)
}
