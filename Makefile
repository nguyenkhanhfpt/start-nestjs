up:
	docker-compose -f docker-compose.local.yml up -d

stop:
	docker-compose -f docker-compose.local.yml stop

up-api:
	docker-compose -f docker-compose.local.yml up -d api

api:
	docker-compose exec -it api sh

worker:
	docker-compose exec -it worker sh
