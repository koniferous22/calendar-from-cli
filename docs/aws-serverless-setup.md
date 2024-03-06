# AWS Deployment - `setup-aws` directory

## Prerequisites

* Purchased domain name, available as AWS Route 53 zone
  * [docs.aws.amazon.com - Route 53 - Registering a new domain](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-register.html)
  * domain, or its underlying Route 53 zone is used as a [terraform data source](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/route53_zone)
* S3 bucket serving as a [terraform backend](https://developer.hashicorp.com/terraform/language/settings/backends/s3)
* [`neon.tech`](https://neon.tech/) account with available project and database

### Additional `.env` variable configuration for terraform

Terraform in the repository doesn't provide full specification of terraform backend. Terraform contains partial backend configruration, while unique details (such as AWS region, S3 bucket, dynamodb table for state locking) are specified by user

Preferred way is to read following environment variables (see [`Makefile`](../Makefile))

```sh
# Replace with actual values
# Region of S3 bucket - also used as region for the rest of terraform resources
TF_BACKEND_REGION="eu-central-1"
TF_BACKEND_BUCKET="your-s3-bucket"
TF_BACKEND_DYNAMODB_TABLE="your-dynamo-db-table-for-state-locking"
```

## Deployment steps

### 1. Configure production prisma

Retrieve connection URLs from [`neon.tech`](https://neon.tech/) console

Configure env variables in `sourcecode-ts/packages/prisma/env/.env.prod.serverless` with direct database URL (i.e. no pooling configuration required)

```sh
# Replace with actual values
CALENDAR_DATABASE_URL=postgresql://my-direct-neon-postgres-connection
DIRECT_CALENDAR_DATABASE_URL=postgresql://my-direct-neon-postgres-connection
```

### 2. Run migrations towards production database

```sh
# executed from project root
make prisma-migrate-serverless
```

### 3. Ensure that dependencies are installed

```sh
# executed from project root
yarn --cwd sourcecode-ts install --frozen-lockfile
```

### 4. Create `prod.serverless` configuration for all components

There is a utility `Makefile` target to

Note - `config.prod.serverless.json` and `config.prod.json` files are considered to override default application config specified in each case in `default.json`, if you omit this step, the default configuration will be propagated to production environment

#### Caveats - CORS

`sourcecode-ts/api/public/config/config.prod.serverless.json` should have CORS enabled, which requires following configuratoin

```json
{
  "cors": {
    "enabled": true,
    "whitelist": ["https://calendar.koniferski.pro"]
  }
}
```

#### Caveats - `trpc` APIs

* `server.bodyParserMiddleware` - **MANDATORY**
  * without this setting requests will fail on `trpc` baching because of server receiving stringified request bodies
    * Example issue with similar error documented [here](https://github.com/trpc/trpc/discussions/1553)
* `server.stderrLogging` - **Optional**
  * without this error messages will not appear in [Cloudwatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html)

```json
{
  "server": {
    "stderrLogging": true,
    "bodyParserMiddleware": true
  }
}
```

These configuration settings are applicable for both

* `sourcecode-ts/api/admin/config/config.prod.serverless.json`
* `sourcecode-ts/api/public/config/config.prod.serverless.json`

#### Caveats - `web`

Make sure to reconfigure `publicApi` in `sourcecode-ts/web/config/config.prod.serverless.json` to match the deployed public API instance. Remaining configuration settings are mostly visual.

#### (Optional) Administration utils

Admin API handles authorization through built-in [AWS IAM Authorizer](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-access-control-iam.html), which requires all requests to be signed with AWS Access Keys.

In order to communicate successfully with the API following configuration is required

```json
{
  "apiAdminFetchingOptions": {
    "apiAdminRuntime": "serverless",
    "shouldUseSignaturev4": true,
    "deployedApiAwsRegion": "eu-central-1",
    "awsAccessKeySecretConfig": {
      "type": "env"
    }
  }
}
```

These configuration settings are applicable for

* `sourcecode-ts/admin-scripts/*/config/config.prod.json`
  * i.e. every entry in `sourcecode-ts/admin-scripts` directory
* `sourcecode-ts/cli/config/config.prod.json`

### 5. Build all deployables

#### 5a. Build packages (required for [AWS Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/chapter-layers.html))

```sh
# executed from project root
make ts-packages-build
```

#### 5b. Build lambda layers

```sh
# executed from project root
make aws-build-lambda-layers
```

#### 5c. Build lambdas

```sh
# executed from project root
make aws-build-lambdas
```

#### 5d. Build webapp

```sh
# executed from project root
make aws-build-webapp
```

### 6. Terraform data sources set-up

Terraform instead of relying on tfvars, terraform reads the configuration options from [AWS SSM Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) terraform [data source](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/ssm_parameter)

You can find the modules all the required settings in `setup-aws/terraform` modules, namely in files

* [`setup-aws/terraform/ssm.tf`](../setup-aws/terraform/ssm.tf)
* [`setup-aws/terraform/backend/api.tf`](../setup-aws/terraform/backend/api.tf)
* [`setup-aws/terraform/backend/jobs.tf`](../setup-aws/terraform/backend/jobs.tf)

Alternatively, SSM Parameters can are made through terraform resources - [excerpt from another of my repositories](https://github.com/koniferous22/tf-parameter-store/blob/master/terraform/projects/calendar-from-cli/calendar-from-cli.tf)

### 7. `tf init`

```sh
# executed from project root
make tf-init
```

### 8. `tf plan`

```sh
# executed from project root
make tf-plan
```

### 9. `tf apply`

```sh
# executed from project root
make tf-apply
```

### 10. Run `prepare-environment` job

This job takes care of minor adjustments before CLI and Webapp can be fully used

```sh
# executed from project root
./setup-aws/scripts/lambda/run/lambda-run-job-prepare-environment
```
