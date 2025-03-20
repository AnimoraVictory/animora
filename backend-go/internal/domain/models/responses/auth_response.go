package responses

import "github.com/htanos/animalia/backend-go/internal/domain/models"

type SignInResponse struct {
	User         models.User
	AccessToken  string
	IdToken      string
	RefreshToken string
}

type RefreshTokenResponse struct {
	AccessToken string
	IdToken     string
}
