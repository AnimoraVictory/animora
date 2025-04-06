.PHONY: codegen create-model deploy

codegen:
# Usage: make codegen NAME=User
	go generate ./ent

create-model:
	go run -mod=mod entgo.io/ent/cmd/ent new $(NAME)

build-api:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o ./bin/api/bootstrap ./cmd/lambda/api

build-dailytask:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o ./bin/dailytask/bootstrap ./cmd/lambda/dailytask

deploy: build-api build-dailytask
	cd aws && cdk deploy --profile animalia