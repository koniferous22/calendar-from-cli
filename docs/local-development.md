# Local development

## 1. Ensure dependencies installed

```sh
yarn --frozen-lockfile
```

## 2. Database setup

Either ensure there's a locally running postgres on port 5432, or start a database instance with steps specified in [`docker-development`](./docker-development.md#1-preparing-db) (requires [docker](https://docs.docker.com/get-docker/))

Note - [`.env.dev.local`](../sourcecode-ts/packages/prisma/env/.env.dev.local) is included as part of the sourcecode for simplicity. Adjust the connection URL in case it's something different than what's specified

## 3. Run migrations

Run migrations towards database

```sh
# executed from project root
make prisma-migrate-local
```

## 4. Build packages

Build all dependencies from `sourcecode-ts/packages`

```sh
# executed from project root
make ts-packages-build
```

## 5. Running dev server

### `api/admin`

```sh
yarn --cwd sourcecode-ts api-admin:dev
```

Note - requires database running

### `api/public`

```sh
yarn --cwd sourcecode-ts api-public:dev
```

Note - requires database running

### `web`

```sh
yarn --cwd sourcecode-ts web:dev
```

Note - requires public API, and (transitively) database running
