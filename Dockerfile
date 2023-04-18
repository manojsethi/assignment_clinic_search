# Build Stage 1
# This build created a staging docker image 
#

# Create image based on the official Node image from dockerhub
FROM node:16.20.0-alpine as build

# Create app directory
WORKDIR /usr/src/app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
#RUN npm set progress=false \
#    && npm config set depth 0 \
#    && npm i install
RUN npm ci

# Get all the code needed to run the app
COPY . .

# Build the app
RUN npm run build

FROM node:16.20.0-alpine as main

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY --from=build /usr/src/app/dist ./dist

# Expose the port the app runs in
EXPOSE 3000

# Serve the app
CMD ["npm", "start"]