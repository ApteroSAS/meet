FROM node:16-alpine
RUN apk add git openssh
RUN npm i -g cross-env

COPY ./modules/basic-modules/package.json ./modules/basic-modules/package.json
COPY ./modules/basic-modules/yarn.lock ./modules/basic-modules/yarn.lock
RUN yarn --cwd ./modules/basic-modules
RUN yarn --cwd ./modules/basic-modules link

COPY ./modules/teams-module/modules/basic-modules/package.json ./modules/teams-module/modules/basic-modules/package.json
COPY ./modules/teams-module/modules/basic-modules/yarn.lock ./modules/teams-module/modules/basic-modules/yarn.lock
RUN yarn --cwd ./modules/teams-module/modules/basic-modules/

COPY ./modules/teams-module/package.json ./modules/teams-module/package.json
COPY ./modules/teams-module/yarn.lock ./modules/teams-module/yarn.lock
RUN yarn --cwd ./modules/teams-module
RUN yarn --cwd ./modules/teams-module link

COPY ./package.json .
COPY ./yarn.lock .

RUN yarn install
RUN yarn link @aptero/axolotis-module-basic
RUN yarn link @aptero/axolotis-module-teams

COPY ./modules/basic-modules/ ./modules/basic-modules/
RUN yarn --cwd ./modules/basic-modules run build

COPY ./modules/teams-module/ ./modules/teams-module/
RUN yarn --cwd ./modules/teams-module/modules/basic-modules/ run build
RUN yarn --cwd ./modules/teams-module run build

COPY . .
RUN yarn run build

FROM nginx:1.21.3-alpine
RUN mkdir /usr/share/nginx/html/data
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/default.conf /etc/nginx/conf.d/default.conf
COPY --from=0 ./dist/ /usr/share/nginx/html/