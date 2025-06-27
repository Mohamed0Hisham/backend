# Use Node.js LTS version as the base image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies
RUN npm install 



# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE ${PORT}

# Command to run the application
CMD ["node", "app.js"]
