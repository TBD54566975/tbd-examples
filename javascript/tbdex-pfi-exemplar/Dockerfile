# Use the official Node.js image as the base image
FROM node:lts

# Set the working directory inside the container
WORKDIR /home/node/app

# Copy package.json and package-lock.json to the working directory
COPY --chown=node:node . /home/node/app/

# Install the application dependencies
RUN npm i

# Download and install dbmate
RUN curl -fsSL https://github.com/amacneil/dbmate/releases/download/v1.12.1/dbmate-linux-amd64 -o dbmate \
    && chmod +x dbmate \
    && mv dbmate /usr/local/bin

EXPOSE 9000
CMD [ "npm", "run", "server" ]