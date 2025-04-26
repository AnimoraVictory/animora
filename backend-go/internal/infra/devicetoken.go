package infra

import (
	"context"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/ent/devicetoken"
	"github.com/google/uuid"
)

type DeviceTokenRepository struct {
	db *ent.Client
}

func NewDeviceTokenRepository(db *ent.Client) *DeviceTokenRepository {
	return &DeviceTokenRepository{
		db: db,
	}
}

func (r *DeviceTokenRepository) Create(userID string, deviceID string, token string, platform string) error {
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		return err
	}

	_, err = r.db.DeviceToken.Create().
		SetUserID(parsedUserID).
		SetDeviceID(deviceID).
		SetToken(token).
		SetPlatform(platform).
		Save(context.Background())

	return err
}

func (r *DeviceTokenRepository) Update(userID string, deviceID string, token string) error {
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		return err
	}

	_, err = r.db.DeviceToken.Update().
		Where(
			devicetoken.UserID(parsedUserID),
			devicetoken.DeviceID(deviceID),
		).
		SetToken(token).
		Save(context.Background())

	return err
}
