# Use an official Node.js runtime as base
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of your backend code
COPY . .

# Expose the backend port (change if your backend uses another port)
EXPOSE 5000

# Start the backend server
CMD ["npm", "run", "dev"]
