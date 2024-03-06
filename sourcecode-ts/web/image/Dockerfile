# Full-stack dockerfile for dev purposes
# * multi-stage optimized for parallel deps build, not for minimal image size
# ! Unsuitable for production (in case it's not clear from the format)

ARG IMAGE_TAG
FROM node:${IMAGE_TAG} AS base
# Install openssl
RUN apt-get update && \
    apt-get install -y libssl-dev
WORKDIR /app
COPY sourcecode-ts/package.json sourcecode-ts/yarn.lock .
COPY sourcecode-ts/packages/prisma packages/prisma
COPY sourcecode-ts/packages/validation-lib packages/validation-lib
COPY sourcecode-ts/packages/secrets packages/secrets
COPY sourcecode-ts/packages/calendar-utils packages/calendar-utils
COPY config/universal /config/universal
RUN yarn --frozen-lockfile && \
    yarn prisma:build:docker && \
    yarn validation-lib:build && \
    yarn secrets:build && \
    yarn calendar-utils:build

FROM base AS build-db-queries
COPY sourcecode-ts/packages/db-queries packages/db-queries
RUN yarn --frozen-lockfile && \
    yarn db-queries:build

FROM base AS build-common-config
COPY sourcecode-ts/packages/common-config packages/common-config
RUN yarn --frozen-lockfile && \
    yarn common-config:build

FROM base AS build-backend-lib
COPY --from=build-db-queries /app/packages/db-queries/build packages/db-queries/build
COPY --from=build-db-queries /app/packages/db-queries/package.json packages/db-queries/package.json
COPY sourcecode-ts/packages/backend-lib packages/backend-lib
RUN yarn --frozen-lockfile && \
    yarn backend-lib:build

FROM base AS build-api-public
COPY --from=build-common-config /app/packages/common-config/build packages/common-config/build
COPY --from=build-common-config /app/packages/common-config/package.json packages/common-config/package.json
COPY --from=build-db-queries /app/packages/db-queries/build packages/db-queries/build
COPY --from=build-db-queries /app/packages/db-queries/package.json packages/db-queries/package.json
COPY --from=build-backend-lib /app/packages/backend-lib/build packages/backend-lib/build
COPY --from=build-backend-lib /app/packages/backend-lib/package.json packages/backend-lib/package.json

COPY sourcecode-ts/api/public api/public
COPY config/scoped/backend /config/scoped/backend
RUN yarn --frozen-lockfile && \
    yarn api-public:build:docker
CMD ["yarn", "api-public:start:docker"]

FROM base AS build-ui-components
COPY sourcecode-ts/packages/ui-components packages/ui-components
RUN yarn --frozen-lockfile && \
    yarn ui-components:build

FROM base AS build-web
COPY config/universal /config/universal
COPY config/scoped/viewer /config/scoped/viewer
# # Copy for types inferred from trpc API during build
COPY sourcecode-ts/api/public api/public
COPY sourcecode-ts/web web
COPY --from=build-api-public /app/packages packages
COPY --from=build-ui-components /app/packages/ui-components/dist packages/ui-components/dist
COPY --from=build-ui-components /app/packages/ui-components/package.json packages/ui-components/package.json
RUN yarn --frozen-lockfile && \
    yarn web:build:docker
CMD ["yarn", "web:preview:docker"]
