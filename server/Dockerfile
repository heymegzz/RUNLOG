FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy server source code
COPY . .

# Expose API port
EXPOSE 5005

# Start the server
CMD ["npm", "start"]
