# Use an official Node.js runtime as a parent image
FROM node:lts-alpine

# Set the working directory in the container
WORKDIR /app

RUN npm cache clean --force

RUN apk add --no-cache ffmpeg

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy all application files to the container
COPY . .

# Expose the port on which your application will run
EXPOSE 3000

# Command to run your application
CMD ["node", "server.js"]
