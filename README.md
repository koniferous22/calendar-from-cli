# `calendar-from-cli`

## About

`calendar-from-cli` is CLI managed calendar web app.

You can preview my personal instance [here](https://calendar.koniferski.pro)

Note: _You can switch the theme in the query string if you don't like blue/turquoise and have time to dig through code a bit_

### Motivation

Purpose of this app is to have publicly available schedule (mostly for streamlining human interactions) as well as have publicly visibly calendar access with restrictions such as

* inability to dig through past
* sensitive data concealment
  * usually with simple pre-configured "BUSY" label, although there's option to override text and description per-event

Calendar app also implements thin access layer through password authentication, to access protected event data.

### Philosophical note

Web app doesn't contain any editing capabilities, it serves as read-only interface, presumed to be accessed under simple URL, while all the editing is being done through CLI.

## Setup

Currently it's possible to run the stack in

* `docker-compose`
  * [Setup instructions](./docs/docker-development.md)
* `serverless`
  * [Setup instructions](./docs/aws-serverless-setup.md)
* Also local development
  * [Setup instructions](./docs/local-development.md)

### Configuration

Configuring `docker` configuration can be done by overriding settings in files named `config.dev.docker.json`

Similar for serverless - `config.prod.serverless.json`

Full details on configurations explained [here](./docs/configuration.md)

## Architecture

### APIs

Solution consists of 2 APIs

* Admin API - located in `sourcecode-ts/api/admin`
* Public API - located in `sourcecode-ts/api/public`

In terms of philosophy (as stated [above](#philosophical-note)), Admin API serves for editing the calendar, its events and viewer access to details, while public API is (mostly) read-only

#### AWS Implemetation notes

AWS deployment of both APIs is in form of Lambda-lith

Reason for this is to retain portability of the solution in case of deployment alternatives

#### IAM Authorization and signature v4

Authorization for Admin API is done through AWS built-in [IAM Authorization](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-access-control-iam.html), which enforces [Signaturev4 request signing](https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-authenticating-requests.html) for entire communication with Admin API (including admin cli)

Setup steps for AWS Deployment described in [CLI setup doc](./docs/cli-setup.md)

### Webapp

Web app is static `react` site...

That's it there not much more to add to it (I think)

## Tech stack

Entire application code is fullstack typescript

### DB

* [`postgresql`](https://www.postgresql.org/docs/)
  * [`neon.tech`](https://neon.tech/) serverless postgres used for serverless deployment

### Backend

* [`prisma` ORM](https://www.prisma.io/)
* [`trpc`](https://trpc.io/)

### UI

* [`vite`](https://vitejs.dev/)
* [`react-router-dom` v6](https://reactrouter.com/en/main)
* [`react`](https://react.dev/)
* [`storybook`](https://storybook.js.org/)
  * for component development

### Misc dependencies (Important building blocks)

* [`aws4fetch`](https://www.npmjs.com/package/aws4fetch) for [signature v4](https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-authenticating-requests.html) requests when communicating with admin API`
  * Note - encountered issues with alternatives, such as [`@smithy/signature-v4`](https://www.npmjs.com/package/@smithy/signature-v4)
* [`date-fns`](https://www.npmjs.com/package/date-fns) and [`date-fns-tz`](https://www.npmjs.com/package/date-fns-tz)
  * Note - At the moment of writing (6.3.2024) `date-fns-tz` are only compatible with `date-fns^2`
* [`inquirer`](https://www.npmjs.com/package/inquirer) for `calendar-admin-cli`
* [`tsx`](https://www.npmjs.com/package/tsx) for client-side scripts
* [`zod`](https://www.npmjs.com/package/zod)

### `local-setup-docker-compose`

* [`docker compose`](https://docs.docker.com/compose/)

### `setup-aws`

* [`terraform`](https://www.terraform.io/)

## Misc repository notes

There is also `/bin` directory for things worth adding into `$PATH` environment variable

Scripts in `/bin` directory require installation of `tsx` package into global modules

i.e.

```sh
# Or some alternative
npm i -g tsx
```

## NYI (Possibly upcoming features)

* Localization
* Google Calendar Integration
* `Dockerfile` build cache
  * `RUN --mount`
* Migrate to OpenTF instead of terraform
* migrate cli to `enquirer` instead of `inquirer`
* abandon AWS Access Keys + migrate to IAM Role and with assuming credentials through STS call
* Fix `sourcecode-ts/packages` typescript incremental build

## License

Proudly made by [`koniferous22`](https://codeberg.org/koniferous22) a.k.a. Steven Koniferski, a.k.a. Samuel Melkovič, a.k.a Steven Breezy, a.k.a. Koniferosaurus Rex, a.k.a. Segedzin Budatinsky, a.k.a. scio100percentyl (formerly known as Štefan Brežný, now reborn as Štefan Koniferský)

Licensed by [GNU Affero General Public License 3.0](https://www.gnu.org/licenses/agpl-3.0.html)

## Testimonials

> Pre takéto kalendáre, utratím všetky denáre (John D. Rockefeller)
