include .env

.PHONY: run run-all seed build psql down-all

run-all: up-db up-adminer run

run: build up-db
	docker compose up api -d

seed:
	docker compose up api -d

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

psql:
	psql $(DATABASE_URL)