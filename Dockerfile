FROM node:8-alpine

#create app directory
WORKDIR /usr/src/app

#Install app dependencies
COPY package.json .

RUN npm install

COPY package.json .

# Bundle app source
COPY . .

EXPOSE 3000

#CMD ["npm","run", "build"]
CMD ["npm","start"]