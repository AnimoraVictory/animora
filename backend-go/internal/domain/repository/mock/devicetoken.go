package mock

import (
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
)

type MockDeviceTokenRepository struct {
	UpsertFunc func(userID string, deviceID string, token string, platform string) error
}

var _ repository.DeviceTokenRepository = (*MockDeviceTokenRepository)(nil)

// Create calls the mocked CreateFunc
func (m *MockDeviceTokenRepository) Upsert(userId string, deviceID string, token string, platform string) error {
	return m.UpsertFunc(userId, deviceID, token, platform)
}
