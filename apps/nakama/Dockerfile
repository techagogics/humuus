FROM node:alpine AS node-builder

WORKDIR /backend

RUN apk add git

COPY package*.json .
RUN npm install --verbose

COPY tsconfig.json .
COPY src/ src/
RUN npx tsc

FROM registry.heroiclabs.com/heroiclabs/nakama:3.22.0

COPY --from=node-builder /backend/build/*.js /nakama/data/modules/build/
COPY nkconfig.yml /nakama/data/