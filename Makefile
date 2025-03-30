include .env

.PHONY: run run-seed run-all seed build psql down-all codegen

run-all: up-adminer run

run: build
	docker compose up api -d

run-attach: build
	docker compose up api

run-seed: build
	SEED=true docker compose up api

build:
	docker compose build

up-db:
	docker compose up db -d

down-db:
	docker compose down db

up-adminer:
	docker compose up adminer -d

down-all:
	docker compoes down

create-model:
# make create-model NAME=Userなど
	cd backend-go && go run -mod=mod entgo.io/ent/cmd/ent new $(NAME)

codegen:
	cd backend-go && go generate ./ent

psql:
	psql $(DATABASE_URL)