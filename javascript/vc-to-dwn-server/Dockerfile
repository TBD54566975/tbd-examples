FROM node:20-bookworm-slim

ARG COMMIT_HASH
ENV COMMIT_HASH=${COMMIT_HASH}

WORKDIR /vc-to-dwn-server

COPY package.json ./
RUN npm install

COPY . .

RUN npm install

EXPOSE 5001

CMD [ "npm", "run", "start" ]