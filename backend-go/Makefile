.PHONY: build deploy

codegen:
# Usage: make codegen NAME=User
	go generate ./ent

create-model:
	go run -mod=mod entgo.io/ent/cmd/ent new $(NAME)

build:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o ./bin/bootstrap ./cmd/lambda

deploy: build
	cd aws && cdk deploy --profile animalia