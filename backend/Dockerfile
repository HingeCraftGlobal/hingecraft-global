FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY worker.js ./

# Expose port
EXPOSE 3000

# Start command (override in docker-compose for worker)
CMD ["node", "src/server.js"]
