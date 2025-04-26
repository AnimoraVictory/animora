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

func (r *DeviceTokenRepository) Upsert(userID string, deviceID string, token string, platform string) error {
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		return err
	}

	ctx := context.Background()

	// まず、該当するDeviceTokenが存在するか探す
	existing, err := r.db.DeviceToken.
		Query().
		Where(
			devicetoken.UserID(parsedUserID),
			devicetoken.DeviceID(deviceID),
		).
		First(ctx)

	if err == nil && existing != nil {
		// 既に存在するなら Update
		_, err = r.db.DeviceToken.
			UpdateOne(existing).
			SetToken(token).
			Save(ctx)
		return err
	}

	if ent.IsNotFound(err) {
		// 見つからないなら Create
		_, err = r.db.DeviceToken.
			Create().
			SetUserID(parsedUserID).
			SetDeviceID(deviceID).
			SetToken(token).
			SetPlatform(platform).
			Save(ctx)
		return err
	}

	// その他のエラーはそのまま返す
	return err
}
