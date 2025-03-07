# Animalia Backend (Go)

This is the Go implementation of the Animalia backend API.

## Features

- User authentication with AWS Cognito
- Pet management
- Post management
- File uploads to AWS S3
- PostgreSQL database with GORM

## Project Structure

```
backend-go/
├── cmd/
│   └── api/
│       └── main.go           # Entry point of the application
├── internal/
│   ├── auth/                 # Authentication related code
│   │   ├── types.go
│   │   └── verifier.go
│   ├── middleware/           # Middleware functions
│   │   └── auth_middleware.go
│   ├── models/               # Database models
│   │   ├── db.go
│   │   └── models.go
│   ├── routes/               # API routes
│   │   ├── auth_routes.go
│   │   ├── pet_routes.go
│   │   ├── post_routes.go
│   │   └── user_routes.go
│   ├── seed/                 # Database seeding
│   │   └── seed.go
│   └── services/             # External services
│       └── s3_service.go
├── .env                      # Environment variables
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose configuration
├── go.mod                    # Go module file
└── go.sum                    # Go module checksum file
```

## Prerequisites

- Go 1.21 or higher
- PostgreSQL
- AWS account with Cognito and S3 configured

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="postgresql://myuser:mypass@localhost:5432/mydatabase"
JWT_SECRET="your-jwt-secret"
AWS_COGNITO_CLIENT_ID="your-cognito-client-id"
AWS_COGNITO_POOL_ID="your-cognito-pool-id"
AWS_REGION="your-aws-region"
AWS_COGNITO_CLIENT_SECRET="your-cognito-client-secret"
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_S3_BUCKET_NAME="your-s3-bucket-name"
```

## Running the Application

### Using Go

```bash
# Install dependencies
go mod download

# Run the application
go run cmd/api/main.go
```

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## Database Seeding

The application includes functionality to seed the database with sample data for development and testing purposes. This creates sample users, pets, posts, comments, and likes.

### Seeding the Database

```bash
# Using Go
go run cmd/api/main.go -seed

# Using Docker
docker-compose exec api go run cmd/api/main.go -seed
```

The seed data includes:
- 5 users with different profiles
- 6 pets associated with users
- 6 posts with content and image URLs
- 7 comments on various posts
- 10 likes on different posts

## API Endpoints

### Authentication

- `POST /auth/verify-email` - Verify email
- `POST /auth/signin` - Sign in
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Get current user
- `POST /auth/signout` - Sign out
- `GET /auth/session` - Get session

### Users

- `POST /users` - Create a new user
- `GET /users/me` - Get the current user

### Pets

- `GET /pets/owner/:ownerId` - Get pets by owner ID
- `POST /pets/new` - Create a new pet

### Posts

- `GET /posts` - Get all posts
- `POST /posts` - Create a new post
