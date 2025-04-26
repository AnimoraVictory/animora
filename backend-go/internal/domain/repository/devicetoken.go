package repository

type DeviceTokenRepository interface {
	Upsert(userID string, deviceID string, token string, platform string) error
}
