FROM node:18-alpine

WORKDIR /src/app

# Copy package.json from collector directory
COPY collector/package*.json ./
RUN npm install

# Copy collector source code
COPY collector/ .
# Copy proto directory
COPY proto/ ./proto/

# The command will be specified in docker-compose.yml
