# ┌───────────┐
# │           │
# │ setup-aws │
# │           │
# └───────────┘

TF_DEPLOYMENT_ENVIRONMENT := prod
TF_PLAN := ../tfplan/tfplan

tf-init:
	terraform -chdir=$(CURDIR)/setup-aws/terraform init -backend-config="bucket=$$TF_BACKEND_BUCKET" -backend-config="region=$$TF_BACKEND_REGION" -backend-config="dynamodb_table=$$TF_BACKEND_DYNAMODB_TABLE"
tf-init-reconfigure:
	terraform -chdir=$(CURDIR)/setup-aws/terraform init -backend-config="bucket=$$TF_BACKEND_BUCKET" -backend-config="region=$$TF_BACKEND_REGION" -backend-config="dynamodb_table=$$TF_BACKEND_DYNAMODB_TABLE" -reconfigure
tf-plan:
	terraform -chdir=$(CURDIR)/setup-aws/terraform plan -var="aws_region=$$TF_BACKEND_REGION" -var="environment=$(TF_DEPLOYMENT_ENVIRONMENT)" -out=$(TF_PLAN)
tf-plan-destroy:
	terraform -chdir=$(CURDIR)/setup-aws/terraform plan -var="aws_region=$$TF_BACKEND_REGION" -var="environment=$(TF_DEPLOYMENT_ENVIRONMENT)" -out=$(TF_PLAN) -destroy
tf-apply:
	terraform -chdir=$(CURDIR)/setup-aws/terraform apply $(TF_PLAN) 
tf-fmt:
	terraform -chdir=$(CURDIR)/setup-aws/terraform fmt -recursive

aws-build-lambdas:
	yarn --cwd $(CURDIR)/sourcecode-ts api-admin:build:serverless
	yarn --cwd $(CURDIR)/sourcecode-ts api-public:build:serverless
	yarn --cwd $(CURDIR)/sourcecode-ts job-calendar-cleanup:build:serverless
	yarn --cwd $(CURDIR)/sourcecode-ts job-migrate-past:build:serverless
	yarn --cwd $(CURDIR)/sourcecode-ts job-prepare-environment:build:serverless

aws-build-lambda-layers:
	yarn --cwd $(CURDIR)/sourcecode-ts aws:build-lambda-layer:libs
	yarn --cwd $(CURDIR)/sourcecode-ts aws:build-lambda-layer:node-modules
	yarn --cwd $(CURDIR)/sourcecode-ts aws:build-lambda-layer:prisma

aws-build-webapp:
	yarn --cwd $(CURDIR)/sourcecode-ts web:build:serverless

cleanup-deploy-directory:
	rm $(CURDIR)/setup-aws/.deploy/*

# ┌────────────────────────────┐
# │                            │
# │ local-setup-docker-compose │
# │                            │
# └────────────────────────────┘

DOCKER_COMPOSE_DOT_ENV := $(CURDIR)/local-setup-docker-compose/env/.env.dev.docker

dc-up-db:
	docker compose --env-file $(DOCKER_COMPOSE_DOT_ENV) -p calendar-from-cli -f $(CURDIR)/local-setup-docker-compose/config/db.docker-compose.yml up --build

dc-down-db:
	docker compose --env-file $(DOCKER_COMPOSE_DOT_ENV) -p calendar-from-cli -f $(CURDIR)/local-setup-docker-compose/config/db.docker-compose.yml down

dc-config-db:
	docker compose --env-file $(DOCKER_COMPOSE_DOT_ENV) -p calendar-from-cli -f $(CURDIR)/local-setup-docker-compose/config/db.docker-compose.yml config

dc-up-api-admin:
	docker compose --env-file $(DOCKER_COMPOSE_DOT_ENV) -p calendar-from-cli -f $(CURDIR)/local-setup-docker-compose/config/api-admin.docker-compose.yml up --build

dc-config-api-admin:
	docker compose --env-file $(DOCKER_COMPOSE_DOT_ENV) -p calendar-from-cli -f $(CURDIR)/local-setup-docker-compose/config/api-admin.docker-compose.yml config

dc-down-api-admin:
	docker compose --env-file $(DOCKER_COMPOSE_DOT_ENV) -p calendar-from-cli -f $(CURDIR)/local-setup-docker-compose/config/api-admin.docker-compose.yml down

dc-up-webapp:
	docker compose --env-file $(DOCKER_COMPOSE_DOT_ENV) -p calendar-from-cli -f $(CURDIR)/local-setup-docker-compose/config/webapp.docker-compose.yml up --build

dc-config-webapp:
	docker compose --env-file $(DOCKER_COMPOSE_DOT_ENV) -p calendar-from-cli -f $(CURDIR)/local-setup-docker-compose/config/webapp.docker-compose.yml config

dc-down-webapp:
	docker compose --env-file $(DOCKER_COMPOSE_DOT_ENV) -p calendar-from-cli -f $(CURDIR)/local-setup-docker-compose/config/webapp.docker-compose.yml down

# ┌───────────────┐
# │               │
# │ sourcecode-ts │
# │               │
# └───────────────┘

api-admin-deps-watch:
	yarn --cwd $(CURDIR)/sourcecode-ts api-admin:deps:watch

api-admin-dev:
	yarn --cwd $(CURDIR)/sourcecode-ts api-admin:dev

api-public-deps-watch:
	yarn --cwd $(CURDIR)/sourcecode-ts api-public:deps:watch

api-public-dev:
	yarn --cwd $(CURDIR)/sourcecode-ts api-public:dev

prisma-db-pull-local:
	yarn --cwd $(CURDIR)/sourcecode-ts prisma:db:pull:local

prisma-migrate-local:
	yarn --cwd $(CURDIR)/sourcecode-ts prisma:migrate:local

prisma-migrate-serverless:
	yarn --cwd $(CURDIR)/sourcecode-ts prisma:migrate:serverless

storybook:
	yarn --cwd $(CURDIR)/sourcecode-ts ui-components:storybook

ts-fmt:
	yarn --cwd $(CURDIR)/sourcecode-ts fmt

# Note - packages are ordered based on dependency graph
ts-packages-build:
	yarn --cwd $(CURDIR)/sourcecode-ts prisma:build:local
	yarn --cwd $(CURDIR)/sourcecode-ts validation-lib:build
	yarn --cwd $(CURDIR)/sourcecode-ts calendar-utils:build
	yarn --cwd $(CURDIR)/sourcecode-ts common-config:build
	yarn --cwd $(CURDIR)/sourcecode-ts secrets:build
	yarn --cwd $(CURDIR)/sourcecode-ts db-queries:build
	yarn --cwd $(CURDIR)/sourcecode-ts backend-lib:build
	yarn --cwd $(CURDIR)/sourcecode-ts ui-components:build

unit-test:
	yarn --cwd $(CURDIR)/sourcecode-ts test

web-dev:
	yarn --cwd $(CURDIR)/sourcecode-ts web:dev
