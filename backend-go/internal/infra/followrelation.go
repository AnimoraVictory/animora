package infra

import (
	"context"
	"fmt"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/ent/followrelation"
	"github.com/aki-13627/animalia/backend-go/ent/user"
	"github.com/google/uuid"
)

type FollowRelationRepository struct {
	db *ent.Client
}

func NewFollowRelationRepository(db *ent.Client) *FollowRelationRepository {
	return &FollowRelationRepository{
		db: db,
	}
}

func (r *FollowRelationRepository) Follow(toId string, fromId string) error {
	fromUUID, err := uuid.Parse(fromId)
	if err != nil {
		return err
	}

	toUUID, err := uuid.Parse(toId)
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

func (r *FollowRelationRepository) Unfollow(toId string, fromId string) error {
	fromUUID, err := uuid.Parse(fromId)
	if err != nil {
		return err
	}

	toUUID, err := uuid.Parse(toId)
	if err != nil {
		return err
	}

	_, err = r.db.FollowRelation.
		Delete().
		Where(
			followrelation.HasFromWith(user.ID(fromUUID)),
			followrelation.HasToWith(user.ID(toUUID)),
		).
		Exec(context.Background())

	if err != nil {
		return fmt.Errorf("failed to unfollow: %w", err)
	}

	return nil
}
