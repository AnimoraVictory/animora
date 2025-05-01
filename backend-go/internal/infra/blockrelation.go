package infra

import (
	"context"
	"fmt"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/ent/blockrelation"
	"github.com/aki-13627/animalia/backend-go/ent/user"
	"github.com/google/uuid"
)

type BlockRelationRepository struct {
	db *ent.Client
}

func NewBlockRelationRepository(db *ent.Client) *BlockRelationRepository {
	return &BlockRelationRepository{db: db}
}

func (r *BlockRelationRepository) Create(fromID, toID string) error {
	fromUUID, err := uuid.Parse(fromID)
	if err != nil {
		return err
	}

	toUUID, err := uuid.Parse(toID)
	if err != nil {
		return err
	}

	_, err = r.db.BlockRelation.Create().
		SetFromID(fromUUID).
		SetToID(toUUID).
		Save(context.Background())
	if err != nil {
		return fmt.Errorf("failed to create block relation in database: %w", err)
	}

	return nil
}

func (r *BlockRelationRepository) Delete(fromID, toID string) error {
	fromUUID, err := uuid.Parse(fromID)
	if err != nil {
		return err
	}

	toUUID, err := uuid.Parse(toID)
	if err != nil {
		return err
	}

	_, err = r.db.BlockRelation.
		Delete().
		Where(
			blockrelation.HasFromWith(user.ID(fromUUID)),
			blockrelation.HasToWith(user.ID(toUUID)),
		).
		Exec(context.Background())

	if err != nil {
		return fmt.Errorf("failed to delete block relation in database: %w", err)
	}

	return nil
}

func (r *BlockRelationRepository) BlockingUsers(fromID string) ([]*ent.User, error) {
	fromUUID, err := uuid.Parse(fromID)
	if err != nil {
		return nil, err
	}

	blockingUsers, err := r.db.BlockRelation.Query().
		Where(blockrelation.HasFromWith(user.ID(fromUUID))).
		All(context.Background())
	if err != nil {
		return nil, err
	}
	users := make([]*ent.User, len(blockingUsers))
	for i, blockingUser := range blockingUsers {
		users[i] = blockingUser.Edges.To
	}
	return users, nil
}

func (r *BlockRelationRepository) BlockedByUsers(toID string) ([]*ent.User, error) {
	toUUID, err := uuid.Parse(toID)
	if err != nil {
		return nil, err
	}
	blockedByUsers, err := r.db.BlockRelation.Query().
		Where(blockrelation.HasToWith(user.ID(toUUID))).
		All(context.Background())
	if err != nil {
		return nil, err
	}
	users := make([]*ent.User, len(blockedByUsers))
	for i, blockedByUser := range blockedByUsers {
		users[i] = blockedByUser.Edges.From
	}
	return users, nil
}
