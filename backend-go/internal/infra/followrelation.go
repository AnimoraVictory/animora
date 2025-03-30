package infra

import (
	"context"

	"github.com/google/uuid"
	"github.com/htanos/animalia/backend-go/ent"
	"github.com/htanos/animalia/backend-go/ent/followrelation"
	"github.com/htanos/animalia/backend-go/ent/user"
)

type FollowRelationRepository struct {
	db *ent.Client
}

func NewFollowRelationRepository(db *ent.Client) *FollowRelationRepository {
	return &FollowRelationRepository{
		db: db,
	}
}

func (r *FollowRelationRepository) CountFollows(userId string) (int, error) {
	userUUID, err := uuid.Parse(userId)
	if err != nil {
		return 0, err
	}
	count, err := r.db.FollowRelation.Query().
		Where(followrelation.HasFromWith(user.ID(userUUID))).
		Count(context.Background())
	if err != nil {
		return 0, err
	}
	return int(count), nil
}

func (r *FollowRelationRepository) CountFollowers(userId string) (int, error) {
	userUUID, err := uuid.Parse(userId)
	if err != nil {
		return 0, err
	}
	count, err := r.db.FollowRelation.Query().
		Where(followrelation.HasToWith(user.ID(userUUID))).
		Count(context.Background())
	if err != nil {
		return 0, err
	}
	return int(count), nil
}

func (r *FollowRelationRepository) Followings(userId string) ([]*ent.User, error) {
	userUUID, err := uuid.Parse(userId)
	if err != nil {
		return nil, err
	}
	followings, err := r.db.FollowRelation.Query().
		Where(followrelation.HasFromWith(user.ID(userUUID))).
		All(context.Background())
	if err != nil {
		return nil, err
	}
	users := make([]*ent.User, len(followings))
	for i, following := range followings {
		users[i] = following.Edges.To
	}
	return users, nil
}

func (r *FollowRelationRepository) Followers(userId string) ([]*ent.User, error) {
	userUUID, err := uuid.Parse(userId)
	if err != nil {
		return nil, err
	}
	followers, err := r.db.FollowRelation.Query().
		Where(followrelation.HasToWith(user.ID(userUUID))).
		All(context.Background())
	if err != nil {
		return nil, err
	}
	users := make([]*ent.User, len(followers))
	for i, follower := range followers {
		users[i] = follower.Edges.From
	}
	return users, nil
}
