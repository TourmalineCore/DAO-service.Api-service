FROM node:16

WORKDIR /src
COPY package.json ./
RUN yarn --production
COPY . ./
RUN yarn build
CMD yarn start:prod