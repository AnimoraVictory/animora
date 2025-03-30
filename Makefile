include .env

.PHONY: run run-seed run-all seed build psql down-all

run-all: up-adminer run

run: build
	docker compose up api -d

run-attach: build
	docker compose up api

run-seed:
	SEED=true docker compose up api -d

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

psql:
	psql $(DATABASE_URL)