package repository

import "github.com/htanos/animalia/backend-go/ent"

type FollowRelationRepository interface {
	CountFollows(userId string) (int, error)
	CountFollowers(userId string) (int, error)
	Followings(userId string) ([]*ent.User, error)
	Followers(userId string) ([]*ent.User, error)
}
