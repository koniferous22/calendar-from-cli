# Docker setup - `local-setup-docker-compose` directory

`docker-compose` setup is considered for development purposes, i.e. images built and used aren't production-ready.

## Steps

### 1. Preparing DB

Start database docker container

```sh
# executed from project root
make dc-up-db
```

### 2. Run migrations

Run migrations towards database

```sh
# executed from project root
make prisma-migrate-local
```

### 3. Running

#### Running `api/admin`

```sh
# executed from project root
make dc-up-api-admin
```

#### Running `webapp` with `api/public`

```sh
# executed from project root
make dc-up-webapp
```

## Note about application docker images

Multi-stage build is applied for image build phase - purely for speed optimization
