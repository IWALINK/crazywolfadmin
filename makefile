up:
	docker-compose -f docker-compose.prod.yml up --build -d
down:
	docker-compose -f docker-compose.prod.yml down -v

restart:
	make down
	make up
