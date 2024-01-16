FROM node:18-alpine as base
WORKDIR /app

FROM base as install-dev
RUN mkdir -p /tmp/dev
COPY package*.json /tmp/dev/
WORKDIR /tmp/dev
RUN npm ci

FROM base as install-prod
RUN mkdir -p /tmp/prod
COPY package*.json /tmp/prod/
WORKDIR /tmp/prod
RUN npm ci --omit=dev

FROM base as prerelease
COPY --from=install-dev /tmp/dev/node_modules node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM base as release
COPY --from=install-prod /tmp/prod/node_modules node_modules
COPY --from=prerelease /app/dist dist
COPY --from=prerelease /app/package.json .
EXPOSE 3000/tcp
CMD ["dist/main.js"]