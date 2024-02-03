FROM node:latest

WORKDIR /home/node/uni-mgr-api
COPY package.json ./
RUN npm i
COPY . .

EXPOSE 8001
ENV API_PORT=8001
ENV CORS_ENABLED=true
CMD ["npm", "start"];
