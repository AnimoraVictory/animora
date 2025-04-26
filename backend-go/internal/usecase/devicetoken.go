package usecase

import "github.com/aki-13627/animalia/backend-go/internal/domain/repository"

type DeviceTokenUsecase struct {
	deviceTokenRepository repository.DeviceTokenRepository
}

func NewDeviceTokenUsecase(deviceTokenRepository repository.DeviceTokenRepository) *DeviceTokenUsecase {
	return &DeviceTokenUsecase{
		deviceTokenRepository: deviceTokenRepository,
	}
}

func (u *DeviceTokenUsecase) Create(userID, deviceID, token, platform string) error {
	return u.deviceTokenRepository.Create(userID, deviceID, token, platform)
}

func (u *DeviceTokenUsecase) Update(userID, deviceID, token string) error {
	return u.deviceTokenRepository.Update(userID, deviceID, token)
}
