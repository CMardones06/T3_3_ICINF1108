# BUILD STAGE ========================================================

FROM node:24-slim AS build

WORKDIR /app

# Prisma needs OpenSSL for its query engine
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@10

# Copy the schema before installing: `postinstall` runs `prisma generate`
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# DEVELOPMENT STAGE ========================================================

FROM build AS dev

ENV NODE_ENV=development

EXPOSE 3000

# Apply pending migrations, then start in watch mode
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm run start:dev"]

# PRODUCTION STAGE ========================================================

FROM node:24-slim AS prod

ENV NODE_ENV=production

WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# pnpm is installed here only to run `pnpm prune --prod` a few lines below.
# The app is executed with `node dist/main`, not pnpm. If we did not prune,
# devDependencies would ship inside the image. pnpm stays in the final image
# as a side effect of this step (small, harmless), and could be removed with
# `npm uninstall -g pnpm` if a truly minimal image were required.
RUN npm install -g pnpm@10

COPY package.json pnpm-lock.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma

# Remove devDependencies from node_modules, leaving only what runtime needs.
# `prisma` is a regular dependency, so the CLI stays available for migrations.
RUN pnpm prune --prod

# Regenerate the Prisma client in case pruning touched node_modules
RUN pnpm exec prisma generate

USER node

EXPOSE 3000

# Apply pending migrations, then start the compiled app
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/main"]
