package usecase

import (
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/htanos/animalia/backend-go/ent"
	"github.com/htanos/animalia/backend-go/internal/domain/repository"
)

type AuthUsecase struct {
	authRepository repository.AuthRepository
	userRepository repository.UserRepository
}

func NewAuthUsecase(authRepository repository.AuthRepository, userRepository repository.UserRepository) *AuthUsecase {
	return &AuthUsecase{
		authRepository: authRepository,
		userRepository: userRepository,
	}
}

func (u *AuthUsecase) VerifyEmail(email, code string) error {
	return u.authRepository.VerifyEmail(email, code)
}

func (u *AuthUsecase) CreateUser(name, email, password string) error {
	return u.authRepository.CreateUser(name, email, password)
}

func (u *AuthUsecase) SignIn(email, password string) (*cognitoidentityprovider.InitiateAuthOutput, error) {
	return u.authRepository.SignIn(email, password)
}

func (u *AuthUsecase) FindByEmail(email string) (*ent.User, error) {
	return u.userRepository.FindByEmail(email)
}

func (u *AuthUsecase) RefreshToken(refreshToken string) (*cognitoidentityprovider.InitiateAuthOutput, error) {
	return u.authRepository.RefreshToken(refreshToken)
}

func (u *AuthUsecase) GetUserEmail(accessToken string) (string, error) {
	return u.authRepository.GetUserEmail(accessToken)
}

func (u *AuthUsecase) SignOut(accessToken string) error {
	return u.authRepository.SignOut(accessToken)
}
