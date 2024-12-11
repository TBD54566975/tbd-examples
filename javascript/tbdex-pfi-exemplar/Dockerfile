# Use the official Node.js image as the base image
FROM node:20.18.1-bookworm

# Set the working directory inside the container
WORKDIR /home/node/app

# Copy every single file in tbdex-pfi-exemplar into the container image
COPY --chown=node:node . /home/node/app/

# Install the application dependencies
RUN npm i

# Download and install dbmate
RUN curl -fsSL https://github.com/amacneil/dbmate/releases/download/v1.12.1/dbmate-linux-amd64 -o dbmate \
    && chmod +x dbmate \
    && mv dbmate /usr/local/bin

EXPOSE 9000
EXPOSE 3001
EXPOSE 3002

# Command to run the migration script, seed the database, and then start the application
CMD [ "/home/node/app/container-start.sh" ]