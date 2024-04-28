FROM node:18-alpine

WORKDIR /src/app

# Copy package.json from worker directory
COPY worker/package*.json ./
RUN npm install

# Copy worker source code
COPY worker/ .
# Copy proto directory
COPY proto/ ./proto/

# The command will be specified in docker-compose.yml
