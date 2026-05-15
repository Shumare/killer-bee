.PHONY: dev build test lint format install docker-up docker-down

install:
	npm install

dev:
	npm run dev

build:
	npm run build

test:
	npm run test

lint:
	npm run lint

format:
	npm run format

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-build:
	docker compose build

docker-logs:
	docker compose logs -f

migrate:
	npm run migration:run --workspace=apps/services/model-service

migrate-revert:
	npm run migration:revert --workspace=apps/services/model-service
