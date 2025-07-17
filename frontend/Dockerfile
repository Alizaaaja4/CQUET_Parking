# Use a Node.js base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
# This means npm install only runs if package.json/lock changes
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
# This should be done AFTER npm install so changes to code don't invalidate node_modules cache
COPY . .

# Expose the port your development server runs on (Vite's default is 5173, but container port is 3000 as per docker-compose)
EXPOSE 3000

# Command to run the development server
# This will be overridden by `command: npm run dev` in docker-compose.yml, but good practice
CMD ["npm", "run", "dev"]