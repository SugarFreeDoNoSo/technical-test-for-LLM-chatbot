# Use an official Node.js base image
FROM node:20

# Set the working directory in the image
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package.json ./

# Install bun in the Node.js image
RUN npm install -g bun

# Install the project dependencies
RUN bun install

# Copy all the project source code into the working directory of the container
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Compile the TypeScript project to JavaScript
RUN bun run build

# Copy the .env.example file to .env
COPY .env.example .env


# Copy run script
COPY run.sh /usr/local/bin/run.sh
RUN chmod +x /usr/local/bin/run.sh


# Expose the port on which the application will listen for requests
EXPOSE 3000

# Added the 'run sh' due to the need to add a sleep to allow the database to start first, the processes continue there
CMD ["run.sh", "sh"]
