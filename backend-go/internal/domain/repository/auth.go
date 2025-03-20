package repository

import (
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
)

type AuthRepository interface {
	GenerateHash(username string) string
	VerifyToken(email, token string) error
	CreateUser(name, email, password string) error
	VerifyEmail(email, code string) error
	SignIn(email, password string) (*cognitoidentityprovider.InitiateAuthOutput, error)
	RefreshToken(refreshToken string) (*cognitoidentityprovider.InitiateAuthOutput, error)
	GetUserEmail(accessToken string) (string, error)
	SignOut(token string) error
}
