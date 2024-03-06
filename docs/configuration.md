# Configuration Hierarchy

Solution configuration consists of multiple layers

1. Universal
2. Scoped
3. Package
4. Environment

## Universal and Scoped configuration

Considering solution consisting of webapp, APIs, CLIs, scripts, background jobs with potentially scaled amount (in possible future) and frequent duplicates within configuration options across applications, all applications inherit from [`[universal` configuration](../config/universal/universal.json). Aim of which is to contain rules that hold for both frontend and backend

There are cases when configuration options shouldn't be repeated accross multiple apps, but shouldn't be necessarily visible for every single application.

For instance UI theme is to very little use from perspective of backend, similarly server-side secret encryption options are not relevant in UI (not to mention potential risk)

For these cases applications inherit from `scoped` config, which serves as a sorting label for each application. Solution contains following scoped configurations

* [`admin`](../config/scoped/admin/admin.json)
  * used for admin interfaces - CLI + admin scripts
* [`backend`](../config/scoped/backend/backend.json)
  * used for API options and background tasks
* [`viewer`](../config/scoped/viewer//viewer.json)
  * use for UI - whoever views the calendar

## Package and Environment config

After top 2 configuration layers ([`universal`](../config/universal/universal.json) and scoped), packages (or applications) can have their own specific configuration, i.e. `package` configuration, that contains options exclusive to the package itself

For example - server port for API server on which API should listen for requests

The last layer should take care of environment differences and potential customization - `environment` configuration

### Environment configuration naming

In context of project, as it's fully composed of Typescript code, override is always dependant on `NODE_ENV` variable, which holds possible values (`dev`, `prod`)

Note - _If `NODE_ENV` holds something different, validator for this env variable will fail_

In case `NODE_ENV` is the only dependency for config resolution, configuration file is named `config.dev.json` or `config.prod.json`

However there are cases when different behaviour is required depending on application runtime

For example - HTTP API as Lambda-lith listens to Lambda Triggers in form of API Gateway emitted events, rather than HTTP requests, which is different behaviour compared to standard HTTP server

For this reasons configuration files are named with both `NODE_ENV` and runtime attribute

Examples:

* `config.dev.docker.json`
* `config.prod.serverless.json`

## Config preprocessing

Because of complexity of loading 4 configuration files for each app, build step for each application includes configuration preprocessing, which merges all 4 configuration layers

It is especially necessary, where dependency bundling is required for deployment (for example `webapp` - deployed as S3 static website), through tools such as rollup, esbuild

### Example

Admin API, which belongs to `backend` scope, running in `docker compose` (i.e. `docker` runtime), with `NODE_ENV=dev`, should merge following 4 configuration files

1. [`universal` config](../config/universal/universal.json)
2. [`backend` scoped config](../config/scoped/backend/backend.json)
3. [`api/admin` package config](../sourcecode-ts/api/admin/config/default.json)
4. [`api/admin` dev.docker override](../sourcecode-ts/api/admin/config/config.dev.docker.json)

## Motivation

Motivation for this setup is the effort to maximize the single source of truth - i.e. maintain (or at least get as close to) the ideal of having everything (or as much as possible) transparently in [`universal`](../config/universal/universal.json) config
