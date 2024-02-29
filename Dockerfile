FROM node:latest

WORKDIR /home/node/uni-mgr-api
COPY package.json .
COPY pnpm-lock.yaml .

RUN corepack install & corepack enable
RUN pnpm i
COPY . .

EXPOSE 8001
ENV API_PORT=8001
CMD ["npm", "start"];
