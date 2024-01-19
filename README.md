# Environment Variables

The following env vars files need to be created:
1. Copy `.env.example` and rename to `.env` (will be used for local development)
2. Copy `.env.example` and rename to `.env.docker` (will be used for application docker container)
3. Copy `.env.docker-compose.example` and rename to `.env.docker-compose` (will be used to start Mongo services)

# Docker

## Application

```
Build image:
docker build --tag hazardsoft/task-manager:latest .

Run image:
docker run --env-file .env.docker --publish 3000:3000/tcp --detach hazardsoft/task-manager:latest
```

## MongoDB

MongoDB can be run locally to ease database creation and testing (incl. UI interface to check db content)

```
Start Mongo services:
docker compose --env-file .env.docker-compose up --detach

Shutdown Mongo services:
docker compose --env-file .env.docker-compose down
```