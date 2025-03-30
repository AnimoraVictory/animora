package infra

import (
	"context"
	"fmt"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/ent/user"
	"github.com/google/uuid"
)

type UserRepository struct {
	db *ent.Client
}

func NewUserRepository(db *ent.Client) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

func (r *UserRepository) GetDB() *ent.Client {
	return r.db
}

func (r *UserRepository) Create(name, email string) (*ent.User, error) {
	exists, err := r.ExistsEmail(email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, fmt.Errorf("このメールアドレスは既に登録されています")
	}

	index, err := r.db.User.Query().Count(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to get user count: %w", err)
	}

	user, err := r.db.User.Create().
		SetName(name).
		SetEmail(email).
		SetIndex(index).
		Save(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to create user in database: %w", err)
	}

	return user, nil
}

func (r *UserRepository) ExistsEmail(email string) (bool, error) {
	exists, err := r.db.User.Query().Where(user.Email(email)).Exist(context.Background())
	if err != nil {
		return false, err
	}
	return exists, nil
}

func (r *UserRepository) FindByEmail(email string) (*ent.User, error) {
	user, err := r.db.User.Query().Where(user.Email(email)).First(context.Background())
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) GetById(id string) (*ent.User, error) {
	userUUID, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}

	user, err := r.db.User.Get(context.Background(), userUUID)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) Update(id string, name string, description string, newImageKey string) error {
	userUUID, err := uuid.Parse(id)
	if err != nil {
		return err
	}

	_, err = r.db.User.UpdateOneID(userUUID).
		SetName(name).
		SetBio(description).
		SetIconImageKey(newImageKey).
		Save(context.Background())
	return err
}

func (r *UserRepository) Follow(fromID string, toID string) error {
	fromUUID, err := uuid.Parse(fromID)
	if err != nil {
		return err
	}

	toUUID, err := uuid.Parse(toID)
	if err != nil {
		return err
	}

	_, err = r.db.FollowRelation.Create().
		SetFromID(fromUUID).
		SetToID(toUUID).
		Save(context.Background())
	if err != nil {
		return fmt.Errorf("failed to create follow relation in database: %w", err)
	}

	return nil
}
