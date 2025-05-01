package repository

type FollowRelationRepository interface {
	Follow(toId string, fromId string) error
	Unfollow(toId string, fromId string) error
}
