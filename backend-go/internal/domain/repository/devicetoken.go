package repository

type DeviceTokenRepository interface {
	Create(userID string, deviceID string, token string, platform string) error
	Update(userID string, deviceID string, token string) error
}
