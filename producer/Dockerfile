FROM node:18-alpine

WORKDIR /src/app

# Copy package.json from producer directory
COPY producer/package*.json ./
RUN npm install

# Copy producer source code
COPY producer/ .
# Copy proto directory
COPY proto/ ./proto/

# The command will be specified in docker-compose.yml
