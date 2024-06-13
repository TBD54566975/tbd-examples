# Use the official Node.js image as the base image
FROM node:lts@sha256:ab71b9da5ba19445dc5bb76bf99c218941db2c4d70ff4de4e0d9ec90920bfe3f

# Set the working directory inside the container
WORKDIR /home/node/app

# Copy package.json and package-lock.json to the working directory
COPY --chown=node:node . /home/node/app/

# Install the application dependencies
RUN npm i

# Download and install dbmate
RUN curl -fsSL https://github.com/amacneil/dbmate/releases/download/v1.12.1/dbmate-linux-amd64 -o dbmate \
    && echo "36430799fa4a4265e05593adf6b5705339c8ddc1d0bcc94040f548c0304c5cf4  dbmate" | sha256sum -c \
    && chmod +x dbmate \
    && mv dbmate /usr/local/bin

EXPOSE 9000
CMD [ "npm", "run", "server" ]