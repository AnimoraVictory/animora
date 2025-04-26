package usecase

import (
	"testing"

	"github.com/aki-13627/animalia/backend-go/internal/domain/repository/mock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestDeviceTokenUsecase_Upsert(t *testing.T) {
	testCase := struct {
		userID   uuid.UUID
		deviceID string
		token    string
		platform string
	}{
		userID:   uuid.New(),
		deviceID: "device-001",
		token:    "token-abc",
		platform: "ios",
	}

	t.Run("存在しなければCreateが呼ばれる", func(t *testing.T) {
		createCalled := false
		updateCalled := false

		mockDeviceTokenRepo := &mock.MockDeviceTokenRepository{
			UpsertFunc: func(userId string, deviceId string, token string, platform string) error {
				if deviceId == "device-001" {
					createCalled = true
				}
				return nil
			},
		}

		usecase := NewDeviceTokenUsecase(mockDeviceTokenRepo)

		err := usecase.Upsert(testCase.userID.String(), testCase.deviceID, testCase.token, testCase.platform)
		assert.NoError(t, err)
		assert.True(t, createCalled)
		assert.False(t, updateCalled)
	})

	t.Run("存在すればUpdateが呼ばれる", func(t *testing.T) {
		createCalled := false
		updateCalled := false

		mockDeviceTokenRepo := &mock.MockDeviceTokenRepository{
			UpsertFunc: func(userId string, deviceId string, token string, platform string) error {
				if deviceId == "already-exists" {
					updateCalled = true
				}
				return nil
			},
		}

		usecase := NewDeviceTokenUsecase(mockDeviceTokenRepo)

		err := usecase.Upsert(testCase.userID.String(), "already-exists", testCase.token, testCase.platform)
		assert.NoError(t, err)
		assert.False(t, createCalled)
		assert.True(t, updateCalled)
	})
}
