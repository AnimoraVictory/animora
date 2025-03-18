package usecase

import (
	"fmt"

	"github.com/htanos/animalia/backend-go/internal/domain/models"
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
	if err := u.authRepository.VerifyEmail(email, code); err != nil {
		return fmt.Errorf("確認コードが無効です: %w", err)
	}

	return nil
}

func (u *AuthUsecase) SignUp(name, email, password string) (*models.User, error) {
	// DB に同じメールアドレスのユーザーが既に存在しないかチェック
	exists, err := u.userRepository.ExistsEmail(email)
	if err != nil {
		return nil, fmt.Errorf("ユーザーの存在チェックに失敗しました: %w", err)
	}
	if exists {
		return nil, fmt.Errorf("このメールアドレスは既に登録されています")
	}

	// Cognitoにユーザーを作成
	if err := u.authRepository.CreateUser(name, email, password); err != nil {
		return nil, fmt.Errorf("failed to create user in Cognito: %w", err)
	}

	// DBにユーザーを作成
	user, err := u.userRepository.Create(name, email)
	if err != nil {
		return nil, fmt.Errorf("ユーザーの作成に失敗しました: %w", err)
	}

	return user, nil
}

type SignInResponse struct {
	User         models.User
	AccessToken  string
	IdToken      string
	RefreshToken string
}

func (u *AuthUsecase) SignIn(email, password string) (*SignInResponse, error) {
	result, err := u.authRepository.SignIn(email, password)
	if err != nil {
		return nil, fmt.Errorf("サインインに失敗しました: %w", err)
	}

	user, err := u.userRepository.FindByEmail(email)
	if err != nil {
		return nil, fmt.Errorf("ユーザーの取得に失敗しました: %w", err)
	}

	return &SignInResponse{
		User:         *user,
		AccessToken:  *result.AuthenticationResult.AccessToken,
		IdToken:      *result.AuthenticationResult.IdToken,
		RefreshToken: *result.AuthenticationResult.RefreshToken,
	}, nil
}

type RefreshTokenResponse struct {
	AccessToken string
	IdToken     string
}

func (u *AuthUsecase) RefreshToken(refreshToken string) (*RefreshTokenResponse, error) {
	result, err := u.authRepository.RefreshToken(refreshToken)
	if err != nil {
		return nil, fmt.Errorf("リフレッシュトークンの更新に失敗しました: %w", err)
	}

	return &RefreshTokenResponse{
		AccessToken: *result.AuthenticationResult.AccessToken,
		IdToken:     *result.AuthenticationResult.IdToken,
	}, nil
}

func (u *AuthUsecase) GetUser(accessToken string) (*models.User, error) {
	email, err := u.authRepository.GetUserEmail(accessToken)
	if err != nil {
		return nil, fmt.Errorf("ユーザーの取得に失敗しました: %w", err)
	}

	user, err := u.userRepository.FindByEmail(email)
	if err != nil {
		return nil, fmt.Errorf("ユーザーの取得に失敗しました: %w", err)
	}

	return user, nil
}

func (u *AuthUsecase) SignOut(accessToken string) error {
	if err := u.authRepository.SignOut(accessToken); err != nil {
		return fmt.Errorf("ログアウトに失敗しました: %w", err)
	}

	return nil
}
