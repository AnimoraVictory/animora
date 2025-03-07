package auth

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
	"github.com/golang-jwt/jwt/v5"
	"github.com/htanos/animalia/backend-go/internal/models"
	"github.com/lestrrat-go/jwx/jwk"
)

var (
	cognitoClient *cognitoidentityprovider.Client
	jwksClient    *jwk.AutoRefresh
)

// InitAuth initializes the auth services
func InitAuth() {
	// Configure AWS SDK
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(os.Getenv("AWS_REGION")))
	if err != nil {
		log.Fatalf("Failed to load AWS config: %v", err)
	}

	// Create Cognito client
	cognitoClient = cognitoidentityprovider.NewFromConfig(cfg)

	// Initialize JWK client for token verification
	jwksClient = jwk.NewAutoRefresh(context.Background())
	region := os.Getenv("AWS_REGION")
	userPoolID := os.Getenv("AWS_COGNITO_POOL_ID")
	jwksURL := fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s/.well-known/jwks.json", region, userPoolID)

	if _, err := jwksClient.Refresh(context.Background(), jwksURL); err != nil {
		log.Fatalf("Failed to refresh JWK endpoint: %v", err)
	}
}

// GenerateSecretHash generates a secret hash for Cognito authentication
func GenerateSecretHash(username string) string {
	secret := os.Getenv("AWS_COGNITO_CLIENT_SECRET")
	clientID := os.Getenv("AWS_COGNITO_CLIENT_ID")
	message := username + clientID
	key := []byte(secret)
	h := hmac.New(sha256.New, key)
	h.Write([]byte(message))
	return base64.StdEncoding.EncodeToString(h.Sum(nil))
}

// VerifyToken verifies a JWT token and returns the user information
func VerifyToken(tokenString string) (*models.User, error) {
	// Parse the token without verification to get the header
	token, _, err := new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})
	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	// Get the key ID from the token header
	if token.Header == nil {
		return nil, errors.New("token header is nil")
	}

	kid, ok := token.Header["kid"].(string)
	if !ok {
		return nil, errors.New("token header does not contain kid")
	}

	// Get the JWK set from the JWKS endpoint
	region := os.Getenv("AWS_REGION")
	userPoolID := os.Getenv("AWS_COGNITO_POOL_ID")
	jwksURL := fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s/.well-known/jwks.json", region, userPoolID)

	keySet, err := jwksClient.Fetch(context.Background(), jwksURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch JWK set: %w", err)
	}

	// Get the key with the matching key ID
	key, found := keySet.LookupKeyID(kid)
	if !found {
		return nil, errors.New("matching key not found in JWK set")
	}

	// Convert the JWK to a public key
	var publicKey interface{}
	if err := key.Raw(&publicKey); err != nil {
		return nil, fmt.Errorf("failed to get public key: %w", err)
	}

	// Parse and verify the token
	parsedToken, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate the algorithm
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return publicKey, nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse and verify token: %w", err)
	}

	// Get the claims from the token
	claims, ok := parsedToken.Claims.(jwt.MapClaims)
	if !ok || !parsedToken.Valid {
		return nil, errors.New("invalid token claims")
	}

	// Get the email from the claims
	email, ok := claims["email"].(string)
	if !ok {
		return nil, errors.New("email not found in token claims")
	}

	// Get the user from the database
	var user models.User
	if err := models.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to get user from database: %w", err)
	}

	return &user, nil
}

// SignUp registers a new user with Cognito and creates a user in the database
func SignUp(name, email, password string) (*models.User, error) {
	// Check if the user already exists in the database
	var existingUser models.User
	if err := models.DB.Where("email = ?", email).First(&existingUser).Error; err == nil {
		return nil, errors.New("user with this email already exists")
	}

	// Generate the secret hash
	secretHash := GenerateSecretHash(email)

	// Register the user with Cognito
	_, err := cognitoClient.SignUp(context.TODO(), &cognitoidentityprovider.SignUpInput{
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
		return nil, fmt.Errorf("failed to register user with Cognito: %w", err)
	}

	// Create the user in the database
	user := models.User{
		Email: email,
		Name:  name,
	}

	if err := models.DB.Create(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to create user in database: %w", err)
	}

	return &user, nil
}

// VerifyEmail confirms a user's email address with Cognito
func VerifyEmail(email, code string) error {
	// Generate the secret hash
	secretHash := GenerateSecretHash(email)

	// Confirm the user's email address with Cognito
	_, err := cognitoClient.ConfirmSignUp(context.TODO(), &cognitoidentityprovider.ConfirmSignUpInput{
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

// SignIn authenticates a user with Cognito and returns the authentication result
func SignIn(email, password string) (*cognitoidentityprovider.InitiateAuthOutput, error) {
	// Generate the secret hash
	secretHash := GenerateSecretHash(email)

	// Authenticate the user with Cognito
	result, err := cognitoClient.InitiateAuth(context.TODO(), &cognitoidentityprovider.InitiateAuthInput{
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

// RefreshToken refreshes a user's authentication tokens
func RefreshToken(refreshToken string) (*cognitoidentityprovider.InitiateAuthOutput, error) {
	// Refresh the user's tokens with Cognito
	result, err := cognitoClient.InitiateAuth(context.TODO(), &cognitoidentityprovider.InitiateAuthInput{
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

// GetUser gets a user's information from Cognito
func GetUser(accessToken string) (*cognitoidentityprovider.GetUserOutput, error) {
	// Get the user's information from Cognito
	result, err := cognitoClient.GetUser(context.TODO(), &cognitoidentityprovider.GetUserInput{
		AccessToken: aws.String(accessToken),
	})

	if err != nil {
		return nil, fmt.Errorf("failed to get user information: %w", err)
	}

	return result, nil
}

// SignOut signs a user out of all devices
func SignOut(accessToken string) error {
	// Sign the user out of all devices
	_, err := cognitoClient.GlobalSignOut(context.TODO(), &cognitoidentityprovider.GlobalSignOutInput{
		AccessToken: aws.String(accessToken),
	})

	if err != nil {
		return fmt.Errorf("failed to sign user out: %w", err)
	}

	return nil
}
