package infra

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
	"github.com/golang-jwt/jwt/v5"
	"github.com/lestrrat-go/jwx/jwk"
)

type CognitoRepository struct {
	region        string
	userPoolId    string
	jwksURL       string
	secret        string
	clientId      string
	jwksClient    *jwk.AutoRefresh
	cognitoClient *cognitoidentityprovider.Client
}

func NewCognitoRepository() *CognitoRepository {
	region := os.Getenv("AWS_REGION")
	fmt.Println("region", region)
	userPoolId := os.Getenv("AWS_COGNITO_POOL_ID")
	jwksURL := fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s/.well-known/jwks.json", region, userPoolId)
	secret := os.Getenv("AWS_COGNITO_CLIENT_SECRET")
	clientId := os.Getenv("AWS_COGNITO_CLIENT_ID")

	// Create Cognito client
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(os.Getenv("AWS_REGION")))
	if err != nil {
		log.Fatalf("Failed to load AWS config: %v", err)
	}
	cognitoClient := cognitoidentityprovider.NewFromConfig(cfg)

	// Initialize JWK client for token verification
	jwksClient := jwk.NewAutoRefresh(context.Background())
	jwksClient.Configure(jwksURL, jwk.WithMinRefreshInterval(15*time.Minute))
	if _, err := jwksClient.Refresh(context.Background(), jwksURL); err != nil {
		log.Fatalf("Failed to refresh JWK endpoint: %v", err)
	}

	return &CognitoRepository{
		region:        region,
		userPoolId:    userPoolId,
		jwksURL:       jwksURL,
		secret:        secret,
		clientId:      clientId,
		jwksClient:    jwksClient,
		cognitoClient: cognitoClient,
	}
}

func (r *CognitoRepository) GenerateHash(username string) string {
	message := username + r.clientId
	key := []byte(r.secret)
	h := hmac.New(sha256.New, key)
	h.Write([]byte(message))
	return base64.StdEncoding.EncodeToString(h.Sum(nil))
}

func (r *CognitoRepository) VerifyToken(email, token string) error {
	parsed, _, err := new(jwt.Parser).ParseUnverified(token, jwt.MapClaims{})
	if err != nil {
		return fmt.Errorf("failed to parse token: %w", err)
	}

	if parsed.Header == nil {
		return errors.New("token header is nil")
	}

	kid, ok := parsed.Header["kid"].(string)
	if !ok {
		return errors.New("token header does not contain kid")
	}

	keySet, err := r.jwksClient.Fetch(context.Background(), r.jwksURL)
	if err != nil {
		return fmt.Errorf("failed to fetch JWK set: %w", err)
	}

	// Get the key with the matching key ID
	key, found := keySet.LookupKeyID(kid)
	if !found {
		return errors.New("matching key not found in JWK set")
	}

	// Convert the JWK to a public key
	var publicKey interface{}
	if err := key.Raw(&publicKey); err != nil {
		return fmt.Errorf("failed to get public key: %w", err)
	}

	// Parse and verify the token
	parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		// Validate the algorithm
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return publicKey, nil
	})

	if err != nil {
		return fmt.Errorf("failed to parse and verify token: %w", err)
	}

	// Get the claims from the token
	claims, ok := parsedToken.Claims.(jwt.MapClaims)
	if !ok || !parsedToken.Valid {
		return errors.New("invalid token claims")
	}

	// Get the email from the claims
	tokenEmail, ok := claims["email"].(string)
	if !ok {
		return errors.New("email not found in token claims")
	}

	if tokenEmail != email {
		return errors.New("email mismatch")
	}

	return nil
}

func (r *CognitoRepository) CreateUser(name, email, password string) error {
	// TODO: これを呼ぶ前に既存のユーザーをチェック
	// Generate the secret hash
	secretHash := r.GenerateHash(email)

	// Register the user with Cognito
	_, err := r.cognitoClient.SignUp(context.TODO(), &cognitoidentityprovider.SignUpInput{
		ClientId: aws.String(os.Getenv("AWS_COGNITO_CLIENT_ID")),
		Username: aws.String(email),
		Password: aws.String(password),
		UserAttributes: []types.AttributeType{
			{
				Name:  aws.String("email"),
				Value: aws.String(email),
			},
		},
		SecretHash: aws.String(secretHash),
	})
	if err != nil {
		return fmt.Errorf("failed to register user with Cognito: %w", err)
	}

	return nil
}

func (r *CognitoRepository) VerifyEmail(email, code string) error {
	// Generate the secret hash
	secretHash := r.GenerateHash(email)

	// Confirm the user's email address with Cognito
	_, err := r.cognitoClient.ConfirmSignUp(context.TODO(), &cognitoidentityprovider.ConfirmSignUpInput{
		ClientId:         aws.String(os.Getenv("AWS_COGNITO_CLIENT_ID")),
		Username:         aws.String(email),
		ConfirmationCode: aws.String(code),
		SecretHash:       aws.String(secretHash),
	})

	if err != nil {
		return fmt.Errorf("failed to confirm user's email address: %w", err)
	}

	return nil
}

func (r *CognitoRepository) SignIn(email, password string) (*cognitoidentityprovider.InitiateAuthOutput, error) {
	// Generate the secret hash
	secretHash := r.GenerateHash(email)

	// Authenticate the user with Cognito
	result, err := r.cognitoClient.InitiateAuth(context.TODO(), &cognitoidentityprovider.InitiateAuthInput{
		AuthFlow: types.AuthFlowTypeUserPasswordAuth,
		ClientId: aws.String(os.Getenv("AWS_COGNITO_CLIENT_ID")),
		AuthParameters: map[string]string{
			"USERNAME":    email,
			"PASSWORD":    password,
			"SECRET_HASH": secretHash,
		},
	})

	if err != nil {
		return nil, fmt.Errorf("failed to authenticate user: %w", err)
	}

	return result, nil
}

func (r *CognitoRepository) RefreshToken(refreshToken string) (*cognitoidentityprovider.InitiateAuthOutput, error) {
	// Refresh the user's tokens with Cognito
	result, err := r.cognitoClient.InitiateAuth(context.TODO(), &cognitoidentityprovider.InitiateAuthInput{
		AuthFlow: types.AuthFlowTypeRefreshTokenAuth,
		ClientId: aws.String(os.Getenv("AWS_COGNITO_CLIENT_ID")),
		AuthParameters: map[string]string{
			"REFRESH_TOKEN": refreshToken,
		},
	})

	if err != nil {
		return nil, fmt.Errorf("failed to refresh tokens: %w", err)
	}

	return result, nil
}

func (r *CognitoRepository) GetUserEmail(accessToken string) (string, error) {
	// Get the user's information from Cognito
	result, err := r.cognitoClient.GetUser(context.TODO(), &cognitoidentityprovider.GetUserInput{
		AccessToken: aws.String(accessToken),
	})

	if err != nil {
		return "", fmt.Errorf("failed to get user information: %w", err)
	}

	var email string
	for _, attr := range result.UserAttributes {
		if *attr.Name == "email" {
			email = *attr.Value
			break
		}
	}

	if email == "" {
		return "", errors.New("email not found in user attributes")
	}

	return email, nil
}

func (r *CognitoRepository) SignOut(accessToken string) error {
	// Sign the user out of all devices
	_, err := r.cognitoClient.GlobalSignOut(context.TODO(), &cognitoidentityprovider.GlobalSignOutInput{
		AccessToken: aws.String(accessToken),
	})

	if err != nil {
		return fmt.Errorf("failed to sign user out: %w", err)
	}

	return nil
}
