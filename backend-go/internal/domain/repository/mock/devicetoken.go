package mock

import (
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
)

type MockDeviceTokenRepository struct {
	CreateFunc func(userID string, deviceID string, token string, platform string) error
	UpdateFunc func(userID string, deviceID string, token string) error
}

var _ repository.DeviceTokenRepository = (*MockDeviceTokenRepository)(nil)

// Create calls the mocked CreateFunc
func (m *MockDeviceTokenRepository) Create(userId string, deviceID string, token string, platform string) error {
	return m.CreateFunc(userId, deviceID, token, platform)
}

// Delete calls the mocked DeleteFunc
func (m *MockDeviceTokenRepository) Update(userId string, deviceID string, token string) error {
	return m.UpdateFunc(userId, deviceID, token)
}
