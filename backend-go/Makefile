.PHONY: build deploy

build:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o ./bin/bootstrap ./cmd/lambda

deploy: build
	cd aws && cdk deploy --profile animalia