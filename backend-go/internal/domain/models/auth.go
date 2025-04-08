package models

import (
	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/google/uuid"
)

type RefreshTokenResponse struct {
	AccessToken string
	IdToken     string
}

type UserBaseResponse struct {
	ID           uuid.UUID `json:"id"`
	Email        string    `json:"email"`
	Name         string    `json:"name"`
	IconImageUrl string    `json:"iconImageUrl"`
}

type UserResponse struct {
	ID             uuid.UUID          `json:"id"`
	Email          string             `json:"email"`
	Name           string             `json:"name"`
	Bio            string             `json:"bio"`
	IconImageUrl   string             `json:"iconImageUrl"`
	Posts          []PostResponse     `json:"posts"`
	Pets           []PetResponse      `json:"pets"`
	Followers      []UserBaseResponse `json:"followers"`
	Follows        []UserBaseResponse `json:"follows"`
	FollowersCount int                `json:"followersCount"`
	FollowsCount   int                `json:"followsCount"`
}

// NewPetResponse converts a Pet to a PetResponse
func NewUserResponse(user *ent.User, imageURL string, posts []PostResponse, pets []PetResponse, followers []UserBaseResponse, follows []UserBaseResponse) UserResponse {
	return UserResponse{
		ID:             user.ID,
		Name:           user.Name,
		Bio:            user.Bio,
		IconImageUrl:   imageURL,
		Posts:          posts,
		Pets:           pets,
		Followers:      followers,
		Follows:        follows,
		FollowersCount: len(followers),
		FollowsCount:   len(follows),
	}
}

func NewUserBaseResponse(user *ent.User, imageURL string) UserBaseResponse {
	return UserBaseResponse{
		ID:           user.ID,
		Email:        user.Email,
		Name:         user.Name,
		IconImageUrl: imageURL,
	}
}
