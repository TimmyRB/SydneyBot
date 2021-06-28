FROM node:14

# Create app directory
RUN mkdir -p /usr/src/SydneyBot
WORKDIR /usr/src/SydneyBot

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Run install
RUN npm i -g npm@7.19.0
RUN npm i -g is-ci husky ts-node
RUN npm ci --only=prod

ENV NODE_ENV production

# Bundle app source
COPY . .

# Run app
CMD [ "npm", "start" ]