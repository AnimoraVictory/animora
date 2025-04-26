package usecase

import (
	"errors"
	"testing"

	"github.com/aki-13627/animalia/backend-go/internal/domain/repository/mock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestDeviceTokenUsecase_Create(t *testing.T) {
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

	mockDeviceTokenRepo := &mock.MockDeviceTokenRepository{
		CreateFunc: func(userId string, deviceId string, token string, platform string) error {
			if deviceId == "already-exists" {
				return errors.New("duplicate entry")
			}
			return nil
		},
	}

	usecase := NewDeviceTokenUsecase(mockDeviceTokenRepo)

	t.Run("正常に作成できる", func(t *testing.T) {
		err := usecase.Create(testCase.userID.String(), testCase.deviceID, testCase.token, testCase.platform)
		assert.NoError(t, err)
	})

	t.Run("同じdeviceIDで2回目Createするとエラーになる", func(t *testing.T) {
		err := usecase.Create(testCase.userID.String(), "already-exists", testCase.token, testCase.platform)
		assert.Error(t, err)
		assert.Equal(t, "duplicate entry", err.Error())
	})
}

func TestDeviceTokenUsecase_Update(t *testing.T) {
	testCases := []struct {
		userID        uuid.UUID
		deviceID      string
		token         string
		mockError     error
		expectedError error
	}{
		{
			userID:        uuid.New(),
			deviceID:      "device-001",
			token:         "token-abc",
			mockError:     nil,
			expectedError: nil,
		},
	}
	for _, tc := range testCases {
		t.Run("正常に更新できる", func(t *testing.T) {
			mockDeviceTokenRepo := &mock.MockDeviceTokenRepository{
				UpdateFunc: func(userId string, deviceId string, token string) error {
					return tc.mockError
				},
			}
			usecase := NewDeviceTokenUsecase(mockDeviceTokenRepo)
			err := usecase.Update(tc.userID.String(), tc.deviceID, tc.token)
			assert.Equal(t, tc.expectedError, err)

		})
	}

}
